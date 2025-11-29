# GitHub Actions CI/CD Workflows

This directory contains automated workflows for the Mykadoo platform. All workflows are designed to ensure code quality, security, and reliable deployments.

## Workflows Overview

### 1. PR Checks (`pr-checks.yml`)

**Trigger:** Pull requests to `main` or `develop`

Comprehensive checks that run on every pull request:

- **Setup**: Install dependencies with caching
- **Lint**: ESLint and TypeScript checking
- **Unit Tests**: Run all unit tests with coverage
- **Build**: Build both web and API applications
- **E2E Tests**: Playwright end-to-end tests
- **Security Audit**: npm audit and Snyk scanning
- **Docker Build**: Test Docker image builds
- **PR Comment**: Automated summary comment

**Required Checks:**
- ✅ Lint must pass
- ✅ Build must succeed
- ✅ Docker builds must succeed
- ⚠️ Tests are informational (non-blocking during setup)

**Duration:** ~15-20 minutes

### 2. Docker Build & Publish (`docker-publish.yml`)

**Trigger:** Push to `main`/`develop`, tags, manual dispatch

Builds and publishes Docker images to Docker Hub:

- Multi-platform builds (linux/amd64, linux/arm64)
- Automatic semantic versioning from tags
- Layer caching with GitHub Actions cache
- Vulnerability scanning with Trivy
- SARIF upload for security insights

**Image Tags:**
- `latest` - Latest from main branch
- `main` - Main branch builds
- `develop` - Develop branch builds
- `v1.2.3` - Semantic version tags
- `sha-abc1234` - Git commit SHA

**Duration:** ~10-15 minutes per app

### 3. Deploy to Staging (`deploy-staging.yml`)

**Trigger:** Push to `main` branch

Automatic deployment to staging environment:

- Helm dependency updates
- Deploy with git SHA as image tag
- Health check verification
- Smoke tests (web and API endpoints)
- Automatic rollback on failure
- Deployment summary in commit comments

**Environment:** `https://staging.mykadoo.com`

**Duration:** ~10-15 minutes

### 4. Deploy to Production (`deploy-production.yml`)

**Trigger:** Release published, manual dispatch

Gradual rollout deployment to production:

1. **Pre-deployment checks**
   - Verify Docker images exist
   - Security scan verification

2. **Canary deployment (10%)**
   - Deploy 1 replica each (web/api)
   - Monitor for 5 minutes

3. **Scale to 50%**
   - Deploy 3 replicas each
   - Monitor for 3 minutes

4. **Full deployment (100%)**
   - Deploy all replicas (5+ based on HPA)
   - Final verification

5. **Post-deployment monitoring**
   - Monitor for 10 minutes
   - Automatic rollback if issues detected

**Environment:** `https://mykadoo.com`

**Duration:** ~30-40 minutes (includes monitoring periods)

**Manual Approval:** Required (GitHub Environment protection)

### 5. Code Coverage (`code-coverage.yml`)

**Trigger:** Push, PR, daily schedule (2 AM UTC)

Comprehensive code coverage analysis:

- Run all tests with coverage
- Merge coverage reports
- Upload to Codecov
- Check against threshold (80%)
- PR comments with coverage delta
- Coverage badges

**Coverage Threshold:** 80% minimum

**Duration:** ~10-15 minutes

### 6. Security Scanning (`security-scan.yml`)

**Trigger:** Push, PR, weekly schedule (Monday 3 AM UTC)

Multi-layered security scanning:

- **Dependency Scanning**
  - npm audit
  - Snyk vulnerability detection

- **Code Analysis**
  - CodeQL for JavaScript/TypeScript
  - Security and quality queries

- **Secret Detection**
  - TruffleHog for exposed secrets
  - GitLeaks scanning

- **Container Security**
  - Trivy vulnerability scanner
  - Grype CVE detection

- **OWASP Dependency Check**
  - Known vulnerable components
  - License compliance

**Duration:** ~20-30 minutes

## Required Secrets

Configure these secrets in GitHub repository settings:

### Docker Registry
```
DOCKER_USERNAME - Docker Hub username
DOCKER_PASSWORD - Docker Hub password or token
```

### Kubernetes
```
KUBE_CONFIG_STAGING - Kubeconfig for staging cluster
KUBE_CONFIG_PRODUCTION - Kubeconfig for production cluster
```

### Database & Cache
```
POSTGRES_PASSWORD_STAGING - PostgreSQL password (staging)
POSTGRES_PASSWORD_PRODUCTION - PostgreSQL password (production)
REDIS_PASSWORD_STAGING - Redis password (staging)
REDIS_PASSWORD_PRODUCTION - Redis password (production)
```

### Security & Monitoring
```
SNYK_TOKEN - Snyk API token for vulnerability scanning
CODECOV_TOKEN - Codecov token for coverage reporting
```

### Optional (for full functionality)
```
SENTRY_DSN - Sentry error tracking
DD_API_KEY - Datadog APM monitoring
```

## Environment Protection Rules

### Staging
- Auto-deployment from `main` branch
- No manual approval required
- Auto-rollback on failure

### Production
- Manual approval required (team leads only)
- Gradual rollout with monitoring
- Auto-rollback on error rate increase >2%

## Workflow Best Practices

### For Developers

1. **Before Creating PR:**
   - Run `yarn nx run-many --target=test --all` locally
   - Run `yarn nx run-many --target=build --all` locally
   - Ensure Docker build works: `docker-compose build`

2. **During PR:**
   - Monitor workflow status in PR
   - Address any failing checks immediately
   - Review security scan results

3. **After Merge:**
   - Monitor staging deployment
   - Verify changes at https://staging.mykadoo.com
   - Check error rates in Datadog/Sentry

### For Production Releases

1. **Create Release:**
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3"
   git push origin v1.2.3
   ```

2. **Publish Release on GitHub:**
   - Go to Releases → Draft new release
   - Select tag `v1.2.3`
   - Add release notes
   - Publish release (triggers production deployment)

3. **Monitor Deployment:**
   - Watch GitHub Actions progress
   - Approve production deployment when prompted
   - Monitor gradual rollout phases
   - Verify at https://mykadoo.com

## Troubleshooting

### PR Checks Failing

**Lint errors:**
```bash
yarn nx run-many --target=lint --all --fix
```

**Build errors:**
```bash
yarn nx reset
yarn install --frozen-lockfile
yarn nx run-many --target=build --all
```

**Test failures:**
```bash
yarn nx run-many --target=test --all --watch
```

### Docker Build Failing

**Check Dockerfile syntax:**
```bash
docker build -t test -f apps/web/Dockerfile .
```

**Clear build cache:**
```bash
docker builder prune -a
```

### Deployment Failing

**Check Kubernetes resources:**
```bash
kubectl get pods -n mykadoo-staging
kubectl logs -n mykadoo-staging deployment/mykadoo-web
```

**Check Helm release:**
```bash
helm list -n mykadoo-staging
helm history mykadoo -n mykadoo-staging
```

**Manual rollback:**
```bash
helm rollback mykadoo -n mykadoo-staging
```

### Security Scan Issues

**High severity vulnerabilities:**
1. Review findings in Security tab
2. Update affected dependencies
3. If no fix available, document risk acceptance

**False positives:**
1. Add to `.snyk` policy file
2. Document justification in comments

## Monitoring & Alerts

All workflows report status to:
- GitHub Actions tab
- PR comments (for PR-triggered workflows)
- Commit comments (for deployments)
- GitHub Step Summaries

**Error notifications:**
- Slack channel: `#mykadoo-deployments` (configure webhook)
- Email: Team leads (GitHub notifications)

## Workflow Metrics

Target metrics for CI/CD pipeline:

| Metric | Target | Current |
|--------|--------|---------|
| PR Check Duration | <20 min | ~15 min |
| Build Success Rate | >95% | - |
| Staging Deploy Duration | <15 min | ~10 min |
| Production Deploy Duration | <40 min | ~35 min |
| Security Scan Duration | <30 min | ~25 min |
| Mean Time to Recovery | <15 min | - |

## Future Enhancements

Planned improvements:

- [ ] Parallel E2E test execution
- [ ] Visual regression testing with Percy/Chromatic
- [ ] Performance benchmarking in CI
- [ ] Automated database migration testing
- [ ] Blue-green deployment option
- [ ] Feature flag integration
- [ ] Slack notifications
- [ ] Custom metrics dashboards

## Support

For issues with CI/CD:
- GitHub Issues: https://github.com/mykadoo/mykadoo2/issues
- Documentation: https://docs.mykadoo.com/cicd
- Team: @devops-team
