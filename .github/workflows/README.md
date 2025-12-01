# GitHub Actions CI/CD Workflows

This directory contains the CI/CD pipeline workflows for the Mykadoo project.

## Workflows

### 1. Pull Request Checks (`pr.yml`)

**Triggers:** Pull requests to `main` or `develop` branches

**Jobs:**
- **Lint**: Runs ESLint on all projects (warnings allowed for now)
- **Test**: Executes unit tests with coverage reporting to Codecov
- **Build**: Builds all projects and reports bundle sizes
- **Storybook**: Builds Storybook and uploads as artifact
- **Dependency Audit**: Runs yarn audit for security vulnerabilities (moderate level)
- **PR Summary**: Aggregates results from all jobs

**Notes:**
- Currently configured with `|| true` to allow failures (development phase)
- Will be tightened to enforce zero warnings/errors before production

### 2. Continuous Integration (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Manual workflow dispatch

**Jobs:**
- **Lint**: Runs ESLint on all projects (strict - fails on warnings)
- **Test**: Executes unit tests with coverage (strict - fails on test failures)
- **Build**: Builds all projects and uploads build artifacts
- **Storybook**: Builds Storybook and uploads as artifact
- **Dependency Audit**: Runs yarn audit (strict - fails on high vulnerabilities)
- **CI Summary**: Aggregates results and fails if any job failed

**Differences from PR workflow:**
- No `|| true` fallbacks - strict enforcement
- Uploads build artifacts for deployment
- Triggers deployment workflows on success

### 3. Deployment (`deploy.yml`)

**Triggers:**
- Push to `develop` → Auto-deploy to staging
- Push to `main` → Auto-deploy to production (with approval)
- Manual workflow dispatch (choose environment)

**Jobs:**

#### Build Images
- Builds Docker images for web and api applications
- Pushes to GitHub Container Registry (ghcr.io)
- Tags images with branch name and commit SHA
- Uses Docker layer caching for faster builds

#### Deploy to Staging
- Deploys to Kubernetes staging namespace
- Updates Helm release with new image tags
- Runs smoke tests (health checks)
- No approval required (automatic)

#### Deploy to Production
- Requires manual approval (GitHub environment protection)
- Creates backup before deployment
- Uses Blue-Green deployment strategy
- Gradual traffic rollout: 10% → 50% → 100% over 15 minutes
- Monitors error rates at each step
- Automatic rollback on failure (<2% error rate increase)
- Runs comprehensive smoke tests

## Required GitHub Secrets

Configure these secrets in GitHub repository settings:

### Container Registry
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions (no setup needed)

### Kubernetes Access
- `KUBECONFIG_STAGING` - Base64-encoded kubeconfig for staging cluster
- `KUBECONFIG_PRODUCTION` - Base64-encoded kubeconfig for production cluster

**To generate:**
```bash
# Staging
cat ~/.kube/config-staging | base64 | pbcopy

# Production
cat ~/.kube/config-production | base64 | pbcopy
```

### Code Coverage
- `CODECOV_TOKEN` - Token for uploading coverage reports to Codecov

**To obtain:**
1. Sign up at https://codecov.io
2. Add your GitHub repository
3. Copy the upload token from repository settings

## Required GitHub Environments

Configure these environments with protection rules:

### Staging
- **Environment name:** `staging`
- **URL:** `https://staging.mykadoo.com`
- **Protection rules:** None (auto-deploy)
- **Secrets:**
  - `KUBECONFIG_STAGING`

### Production
- **Environment name:** `production`
- **URL:** `https://mykadoo.com`
- **Protection rules:**
  - Required reviewers: At least 1 approval
  - Wait timer: 0 minutes
  - Deployment branches: `main` only
- **Secrets:**
  - `KUBECONFIG_PRODUCTION`

**To configure:**
1. Go to repository Settings → Environments
2. Click "New environment"
3. Enter environment name
4. Configure protection rules
5. Add environment secrets

## Branch Protection Rules

Configure these rules for protected branches:

### Main Branch (`main`)
- **Require pull request reviews:** 1 approval
- **Require status checks to pass:**
  - Lint
  - Test
  - Build
  - Storybook
  - Dependency Audit
- **Require branches to be up to date:** Yes
- **Require conversation resolution:** Yes
- **Do not allow bypassing:** Yes
- **Restrict who can push:** Admins only

### Develop Branch (`develop`)
- **Require pull request reviews:** 1 approval
- **Require status checks to pass:**
  - Lint
  - Test
  - Build
  - Storybook
- **Require branches to be up to date:** Yes
- **Allow force pushes:** No

**To configure:**
1. Go to repository Settings → Branches
2. Add branch protection rule
3. Enter branch name pattern
4. Enable protection rules as listed above

## Local Development

### Testing Workflows Locally

Use [act](https://github.com/nektos/act) to test workflows locally:

```bash
# Install act
brew install act

# Test PR workflow
act pull_request -W .github/workflows/pr.yml

# Test CI workflow
act push -W .github/workflows/ci.yml

# Test deploy workflow (staging)
act push -e .github/workflows/test-event.json -W .github/workflows/deploy.yml
```

### Workflow Syntax Validation

```bash
# Install actionlint
brew install actionlint

# Validate all workflows
actionlint .github/workflows/*.yml
```

## Deployment Strategy

### Blue-Green Deployment

The production deployment uses a Blue-Green strategy with gradual traffic rollout:

1. **Deploy Green (New Version)**
   - New pods are deployed alongside existing pods
   - Health checks ensure new pods are ready
   - No traffic is routed yet

2. **Gradual Traffic Shift**
   - **10% for 5 minutes** - Monitor error rates
   - **50% for 10 minutes** - Monitor performance
   - **100%** - Full cutover to new version

3. **Validation**
   - Error rate monitoring at each step
   - Automatic rollback if error rate >2%
   - Smoke tests verify critical paths

4. **Cleanup**
   - Old version (Blue) remains available for rollback
   - After 24 hours, old pods are scaled down

### Rollback Procedure

**Automatic Rollback:**
- Triggered on deployment failure
- Triggered on high error rate (>2%)
- Completes in <2 minutes

**Manual Rollback:**
```bash
# Via Helm
helm rollback mykadoo -n production

# Via kubectl
kubectl rollout undo deployment/mykadoo-web -n production
kubectl rollout undo deployment/mykadoo-api -n production
```

## Monitoring

### GitHub Actions
- View workflow runs: Actions tab
- Monitor deployment status: Environments tab
- Check deployment history: Deployments page

### Application Monitoring
- **Staging:** https://staging.mykadoo.com/health
- **Production:** https://mykadoo.com/health
- **Metrics:** Datadog dashboard (to be configured)
- **Logs:** ELK stack (to be configured)

## Troubleshooting

### Workflow Fails on Lint
```bash
# Run locally to see errors
yarn nx run-many --target=lint --all

# Auto-fix issues
yarn nx run-many --target=lint --all --fix
```

### Workflow Fails on Tests
```bash
# Run tests locally
yarn nx run-many --target=test --all

# Run with coverage
yarn nx run-many --target=test --all --coverage

# Run specific project
yarn nx test <project-name>
```

### Workflow Fails on Build
```bash
# Run build locally
yarn nx run-many --target=build --all

# Check for type errors
yarn nx run-many --target=build --all --verbose
```

### Deployment Fails
1. Check pod logs:
   ```bash
   kubectl logs -n <namespace> -l app=mykadoo-web --tail=100
   kubectl logs -n <namespace> -l app=mykadoo-api --tail=100
   ```

2. Check pod status:
   ```bash
   kubectl get pods -n <namespace>
   kubectl describe pod <pod-name> -n <namespace>
   ```

3. Check Helm release:
   ```bash
   helm status mykadoo -n <namespace>
   helm history mykadoo -n <namespace>
   ```

4. Rollback if needed:
   ```bash
   helm rollback mykadoo -n <namespace>
   ```

## Future Enhancements

- [ ] Add E2E tests with Playwright
- [ ] Add visual regression tests with Percy/Chromatic
- [ ] Add performance testing with Lighthouse CI
- [ ] Add security scanning with Snyk
- [ ] Add SAST/DAST with SonarQube
- [ ] Add canary deployments (5% → 10% → 25% → 50% → 100%)
- [ ] Add feature flags for progressive rollouts
- [ ] Add automated rollback based on metrics (error rate, latency, etc.)
- [ ] Add Slack/Discord notifications for deployments
- [ ] Add GitHub deployment status badges
