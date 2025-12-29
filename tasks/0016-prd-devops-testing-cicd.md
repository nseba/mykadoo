# PRD: DevOps, Testing & CI/CD Infrastructure

## Introduction

To ensure code quality, streamline development, and maintain platform reliability, Mykadoo needs robust automated testing and continuous integration/continuous deployment (CI/CD) pipelines. This PRD defines the testing strategy, quality gates, and deployment automation that will support rapid, confident releases.

## Problem Statement

Without proper DevOps practices and automated testing:
- Bugs reach production causing user frustration
- Deployment process is slow and error-prone
- Code quality degrades over time
- Manual testing is time-consuming and inconsistent
- Rollbacks are difficult and risky
- Team velocity decreases as codebase grows

## Goals

1. Achieve >80% code coverage with automated tests
2. Deploy to production multiple times per day safely
3. Reduce deployment time from hours to minutes (<10 min)
4. Catch 95%+ of bugs before reaching production
5. Automate all quality checks (linting, testing, security)
6. Enable instant rollback on deployment failures
7. Maintain <1% deployment failure rate
8. Zero-downtime deployments for all releases

## User Stories

### As a developer:
- I want automated tests so that I catch bugs early
- I want fast CI/CD pipelines so that I get quick feedback
- I want confident deployments so that I don't fear releasing
- I want easy rollbacks so that I can fix issues quickly

### As a product manager:
- I want rapid releases so that features reach users quickly
- I want deployment visibility so that I know what's in production
- I want quality assurances so that releases are stable

### As an end user:
- I want a stable platform so that my experience is reliable
- I want new features quickly so that the product improves
- I want fast bug fixes so that issues don't linger

## Functional Requirements

### 1. Test Strategy & Coverage

**1.1** Test pyramid must include:

**Unit Tests (70% of total tests):**
- Test individual functions and methods
- Mock external dependencies
- Run in <5 seconds per suite
- Target: >80% code coverage

**Integration Tests (20% of total tests):**
- Test API endpoints end-to-end
- Test database interactions
- Test external service integrations
- Run in <2 minutes per suite

**End-to-End Tests (10% of total tests):**
- Test critical user journeys
- Test across frontend + backend
- Run in <10 minutes per suite
- Cover: registration, gift search, affiliate click, checkout

**1.2** Testing frameworks must use:

**Frontend:**
```typescript
// Unit/Integration: Jest + React Testing Library
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('gift search form submits correctly', async () => {
  render(<GiftSearchForm />);
  await userEvent.type(screen.getByLabelText('Budget'), '100');
  await userEvent.click(screen.getByText('Search'));
  await waitFor(() => {
    expect(screen.getByText('10 gifts found')).toBeInTheDocument();
  });
});

// E2E: Playwright
import { test, expect } from '@playwright/test';

test('complete gift search flow', async ({ page }) => {
  await page.goto('/search');
  await page.fill('[name="budget"]', '100');
  await page.click('button:text("Search")');
  await expect(page.locator('.gift-card')).toHaveCount(10);
});
```

**Backend:**
```typescript
// Unit: Jest
describe('GiftRecommendationService', () => {
  it('should return 10 gifts within budget', async () => {
    const gifts = await service.getRecommendations({
      budget: { min: 50, max: 100 },
    });
    expect(gifts).toHaveLength(10);
    gifts.forEach(gift => {
      expect(gift.price).toBeGreaterThanOrEqual(50);
      expect(gift.price).toBeLessThanOrEqual(100);
    });
  });
});

// Integration: Supertest + TestContainers
import request from 'supertest';

describe('POST /api/search', () => {
  it('should return gift recommendations', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ budget: { min: 50, max: 100 } })
      .expect(200);

    expect(response.body.gifts).toHaveLength(10);
  });
});
```

**1.3** Test requirements:
- All new code must include tests
- PRs cannot merge with <80% coverage
- Critical paths must have E2E tests
- Flaky tests must be fixed or removed within 24hrs
- Tests must run in CI before merge

**1.4** Visual regression testing:
- Snapshot tests for components (React Testing Library)
- Visual diff testing with Percy or Chromatic
- Run on every PR for UI components
- Automatic approval for minor changes, manual review for major

### 2. Continuous Integration (CI)

**2.1** CI pipeline must run on every PR and push:

**Pipeline Stages:**
1. **Install** (2 min)
   - Install dependencies (cached)
   - Verify lockfile integrity

2. **Lint & Format** (1 min)
   - ESLint (TypeScript, React rules)
   - Prettier check
   - TypeScript type check
   - Fail on any errors or warnings

3. **Unit Tests** (3 min)
   - Run all unit tests
   - Generate coverage report
   - Fail if <80% coverage

4. **Integration Tests** (5 min)
   - Spin up test database (TestContainers)
   - Run API integration tests
   - Tear down test environment

5. **Build** (4 min)
   - Build frontend (Next.js)
   - Build backend (NestJS)
   - Verify no build errors

6. **E2E Tests** (10 min)
   - Start application in test mode
   - Run Playwright tests
   - Capture screenshots/videos on failure

7. **Security Scan** (2 min)
   - npm audit / yarn audit
   - Snyk vulnerability scan
   - SAST (Static Application Security Testing)
   - Fail on high/critical vulnerabilities

8. **Deploy Preview** (3 min)
   - Deploy to preview environment (Vercel/Netlify)
   - Comment PR with preview URL

**Total Time:** <30 minutes

**2.2** CI configuration must:
- Use GitHub Actions or GitLab CI
- Run in parallel where possible (lint + tests concurrently)
- Cache dependencies for faster runs
- Use matrix builds (Node 18, 20)
- Auto-cancel outdated runs
- Require all checks to pass before merge

**2.3** Branch protection must enforce:
- CI must pass (all checks green)
- At least 1 approval from code owner
- Branch must be up-to-date with main
- No merge commits (squash or rebase)

**2.4** Example GitHub Actions workflow:
```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn test:coverage
      - uses: codecov/codecov-action@v3

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn build

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'yarn'
      - run: yarn install --frozen-lockfile
      - run: yarn playwright install --with-deps
      - run: yarn test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-results
          path: test-results/
```

### 3. Continuous Deployment (CD)

**3.1** Deployment pipeline must support:

**Environments:**
- **Development** (dev.mykadoo.com) - Auto-deploy on push to `develop`
- **Staging** (staging.mykadoo.com) - Auto-deploy on push to `main`
- **Production** (mykadoo.com) - Manual approval after staging validation

**3.2** Deployment strategy must use:
- **Blue-Green Deployment**: Run new version alongside old, switch traffic
- **Health Checks**: Verify new deployment before traffic switch
- **Gradual Rollout**: 10% → 50% → 100% traffic over 30 minutes
- **Automatic Rollback**: Revert if error rate increases >2%

**3.3** Deployment steps:
1. **Pre-Deploy Checks**
   - All CI checks passed
   - Staging environment validated
   - Database migrations prepared (if any)

2. **Deploy**
   - Build Docker images
   - Tag with version (semver + git SHA)
   - Push to container registry
   - Deploy to Kubernetes/ECS with rolling update
   - Run database migrations (zero-downtime)

3. **Post-Deploy Validation**
   - Run smoke tests (critical paths)
   - Monitor error rates
   - Check performance metrics
   - Verify key features functional

4. **Gradual Rollout** (Production Only)
   - Send 10% traffic to new version (monitor 10 min)
   - Increase to 50% (monitor 10 min)
   - Increase to 100% (monitor 10 min)
   - If any errors, automatic rollback

5. **Notification**
   - Slack notification with deployment status
   - Update status page if needed

**3.4** Rollback procedure must:
- Be triggered automatically on health check failure
- Support manual triggering via CLI/dashboard
- Revert to previous version in <2 minutes
- Preserve database state (don't rollback migrations)
- Send immediate Slack alert

**3.5** Example deployment workflow:
```yaml
name: Deploy to Production

on:
  workflow_dispatch: # Manual trigger
    inputs:
      version:
        description: 'Version to deploy'
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
        with:
          ref: ${{ github.event.inputs.version }}

      - name: Build and push Docker image
        run: |
          docker build -t mykadoo:${{ github.event.inputs.version }} .
          docker push mykadoo:${{ github.event.inputs.version }}

      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/mykadoo \
            mykadoo=mykadoo:${{ github.event.inputs.version }}

      - name: Wait for rollout
        run: kubectl rollout status deployment/mykadoo

      - name: Run smoke tests
        run: yarn test:smoke --env=production

      - name: Notify Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deployment ${{ job.status }}: ${{ github.event.inputs.version }}"
            }
```

### 4. Code Quality Gates

**4.1** Pre-commit hooks must run:
```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**4.2** Code quality tools must include:
- **ESLint**: TypeScript, React, accessibility rules
- **Prettier**: Code formatting (standardized)
- **TypeScript**: Strict mode enabled
- **SonarQube**: Code smell detection
- **Dependency Scanning**: Outdated/vulnerable deps

**4.3** Quality metrics tracked:
- Code coverage (target: >80%)
- Code duplication (target: <3%)
- Cyclomatic complexity (target: <10 per function)
- Technical debt ratio (target: <5%)

**4.4** Pull request requirements:
- Pass all CI checks
- Code coverage doesn't decrease
- No new high/critical vulnerabilities
- TypeScript strict mode passes
- At least 1 code review approval
- All conversations resolved

### 5. Infrastructure as Code (IaC)

**5.1** Infrastructure must be defined in code:
- **Terraform** for cloud resources (AWS/GCP)
- **Docker** for application containers
- **Kubernetes** manifests or Helm charts for orchestration
- Version controlled in Git

**5.2** IaC must define:
```hcl
# Example Terraform
resource "aws_ecs_service" "mykadoo_web" {
  name            = "mykadoo-web"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 3

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "web"
    container_port   = 3000
  }

  deployment_configuration {
    maximum_percent         = 200
    minimum_healthy_percent = 100
  }

  health_check_grace_period_seconds = 60
}
```

**5.3** Environment management:
- Separate configs for dev, staging, production
- Secrets stored in AWS Secrets Manager / HashiCorp Vault
- Never commit secrets to Git
- Use environment variables for configuration

### 6. Database Migrations

**6.1** Migration strategy must:
- Use version-controlled migrations (Prisma, TypeORM, or Liquibase)
- Support forward and backward migrations
- Run automatically on deployment
- Be zero-downtime (additive changes only)

**6.2** Migration best practices:
```typescript
// Example Prisma migration
-- AddGiftCategoryColumn
ALTER TABLE "Gift" ADD COLUMN "category" TEXT;

-- Backfill existing data
UPDATE "Gift" SET "category" = 'other' WHERE "category" IS NULL;

-- Make column required (after backfill)
ALTER TABLE "Gift" ALTER COLUMN "category" SET NOT NULL;
```

**6.3** Migration testing:
- Test migrations on staging first
- Backup database before production migrations
- Monitor migration duration
- Automatic rollback on failure

### 7. Monitoring & Alerting (In CD Pipeline)

**7.1** Post-deploy monitoring must track:
- Error rate (HTTP 500s)
- Latency (p50, p95, p99)
- Traffic (requests per minute)
- Resource usage (CPU, memory)

**7.2** Deployment alerts must trigger:
- Error rate increases >2% after deploy
- Latency increases >20% after deploy
- Health check failures
- Pod/container restarts

**7.3** Deployment dashboard must show:
- Current version in each environment
- Deployment history (last 20)
- Rollback history
- Deployment status (in progress, success, failed)

### 8. Release Management

**8.1** Versioning must follow Semantic Versioning (semver):
- **MAJOR**: Breaking changes (v2.0.0)
- **MINOR**: New features (v1.1.0)
- **PATCH**: Bug fixes (v1.0.1)

**8.2** Release process must:
- Auto-generate changelog from commits (Conventional Commits)
- Create Git tag for each release
- Build release artifacts (Docker images)
- Update documentation with release notes

**8.3** Changelog generation:
```bash
# Conventional Commits
feat: add conversational AI agents
fix: resolve gift search crash on empty budget
chore: upgrade dependencies
docs: update API documentation

# Auto-generated changelog
## v1.2.0 (2025-11-27)

### Features
- Add conversational AI agents with personalities

### Bug Fixes
- Resolve gift search crash when budget is empty

### Chores
- Upgrade dependencies to latest versions
```

## Non-Goals (Out of Scope)

- Manual testing (except exploratory/UX testing) - Automate everything
- Long-lived feature branches - Use trunk-based development
- Deployment on Fridays (reduce risk) - Monday-Thursday only
- Hot patches without testing - All code through CI/CD
- Multiple versions in production - Single version at a time

## Technical Considerations

### CI/CD Platforms

**Option 1: GitHub Actions**
- Pros: Native GitHub integration, free for public repos, good marketplace
- Cons: Can be expensive for private repos, limited to GitHub

**Option 2: GitLab CI**
- Pros: Integrated with GitLab, generous free tier, Docker support
- Cons: Requires GitLab (not GitHub)

**Option 3: CircleCI**
- Pros: Fast builds, good caching, easy config
- Cons: Can be expensive, requires external service

**Recommendation**: GitHub Actions (assuming GitHub repo)

### Deployment Platforms

**Option 1: Vercel (Frontend) + AWS ECS (Backend)**
- Pros: Zero-config for Next.js, automatic preview deployments
- Cons: More complex (multiple platforms)

**Option 2: Kubernetes (EKS, GKE, or AKS)**
- Pros: Full control, scalable, portable
- Cons: Complex setup, requires DevOps expertise

**Option 3: Render / Railway**
- Pros: Simple, fast, good DX
- Cons: Less control, can be expensive at scale

**Recommendation**: Start with Vercel + Render, migrate to Kubernetes for scale

### Container Strategy

```dockerfile
# Multi-stage build for optimization
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

## Design Considerations

### CI/CD Dashboard

**Deployment View:**
- Visual pipeline (stages with status)
- Real-time logs streaming
- Deployment history timeline
- Quick rollback button

**Metrics View:**
- Deployment frequency (per day/week)
- Lead time (commit to production)
- Mean time to recovery (MTTR)
- Change failure rate

**Environment Status:**
- Current version in each environment
- Health status (green/yellow/red)
- Last deployment time
- Next scheduled deployment

## Success Metrics

### CI/CD Performance
- **Target:** <30 min CI pipeline duration
- **Target:** <10 min deployment duration
- **Target:** >99% CI pipeline success rate
- **Target:** <1% deployment failure rate

### Code Quality
- **Target:** >80% code coverage
- **Target:** 0 high/critical vulnerabilities in production
- **Target:** <5% technical debt ratio
- **Target:** <10 cyclomatic complexity per function

### Release Velocity
- **Target:** 5+ deployments per week
- **Target:** <24hr from commit to production (for small changes)
- **Target:** <2hr mean time to recovery (MTTR)
- **Target:** <5min to rollback on failure

### Team Productivity
- **Target:** 50% reduction in time spent on deployments
- **Target:** 90% reduction in deployment-related incidents
- **Target:** 100% of deployments with zero downtime

## Open Questions

1. **Feature Flags**: Should we implement feature flags for gradual rollout of new features?

2. **Canary Deployments**: Should we use canary deployments in addition to blue-green?

3. **Testing in Production**: Should we run smoke tests against production after deploy?

4. **Performance Testing**: Should we include load/performance tests in CI?

5. **Multi-Region Deployments**: How do we handle deployments to multiple regions?

6. **Database Migration Rollback**: What's our strategy for rolling back schema changes?

## Implementation Phases

### Phase 1: CI Foundation (Weeks 1-2)
- Set up GitHub Actions
- Implement lint, type-check, unit tests
- Code coverage reporting
- Branch protection rules

### Phase 2: Automated Testing (Weeks 3-4)
- Integration test setup (TestContainers)
- E2E test framework (Playwright)
- Critical path E2E tests
- Visual regression testing

### Phase 3: CD Pipeline (Weeks 5-6)
- Deployment to staging automation
- Docker containerization
- Infrastructure as Code (Terraform)
- Database migration automation

### Phase 4: Production Deployment (Week 7)
- Production deployment pipeline
- Blue-green deployment
- Health checks and monitoring
- Rollback automation

### Phase 5: Optimization (Week 8)
- Pipeline performance tuning
- Gradual rollout implementation
- Deployment dashboard
- Alert configuration

## Dependencies

- Infrastructure setup (AWS/GCP account, Kubernetes cluster)
- Monitoring infrastructure (PRD 0019)
- Docker registry (Docker Hub, ECR, GCR)
- CI/CD platform access (GitHub Actions)

## Risks & Mitigation

### Risk 1: Flaky Tests
**Mitigation:**
- Quarantine flaky tests immediately
- Fix or remove within 24 hours
- Retry failed tests 1-2 times before marking as failed
- Monitor test stability metrics

### Risk 2: Long CI/CD Pipeline Duration
**Mitigation:**
- Parallelize independent jobs
- Cache dependencies aggressively
- Use incremental builds
- Skip E2E tests for trivial changes (docs only)

### Risk 3: Deployment Failures
**Mitigation:**
- Thorough testing in staging
- Gradual rollout to production
- Automatic health checks
- Fast rollback capability (<2 min)

### Risk 4: Database Migration Issues
**Mitigation:**
- Test migrations in staging first
- Use zero-downtime migration patterns
- Backup database before migrations
- Have rollback plan for schema changes

## Acceptance Criteria

- [ ] CI pipeline runs on every PR
- [ ] All quality gates enforced (lint, type-check, tests)
- [ ] >80% code coverage required to merge
- [ ] E2E tests cover critical user journeys
- [ ] Deployments to staging fully automated
- [ ] Deployments to production require manual approval
- [ ] Blue-green deployment implemented
- [ ] Health checks validate deployments
- [ ] Automatic rollback on failure works
- [ ] Database migrations run zero-downtime
- [ ] Infrastructure defined in Terraform
- [ ] Secrets managed securely (not in Git)
- [ ] Deployment notifications sent to Slack
- [ ] Deployment dashboard shows all environments
- [ ] Semantic versioning enforced
- [ ] Changelogs auto-generated
- [ ] CI pipeline completes in <30 minutes
- [ ] Deployments complete in <10 minutes
- [ ] Rollback completes in <2 minutes

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
**Status:** ✅ COMPLETED
**Author:** AI Product Team
**Reviewers:** Engineering, DevOps, QA, Product
