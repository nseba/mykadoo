# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Mykadoo** is an AI-powered gift search engine that helps users find the perfect gifts based on their preferences and interests. The platform uses conversational AI agents with distinct personalities to provide personalized gift recommendations through e-commerce affiliate integrations.

**Business Model:** Tiered subscription (Free/Gold/Platinum) with affiliate commission revenue.

## Architecture

### Monorepo Structure (Planned)

```
mykadoo2/
├── apps/
│   ├── web/                 # Next.js 14 frontend (App Router)
│   ├── api/                 # NestJS backend API
│   ├── admin/               # Admin CMS interface
│   └── mobile/              # React Native (future)
├── libs/
│   ├── ai/                  # OpenAI/Anthropic integration, LangChain orchestration
│   ├── affiliate/           # Amazon, ShareASale, CJ Affiliate integrations
│   ├── auth/                # JWT auth, OAuth (Google/Facebook)
│   ├── database/            # Prisma/TypeORM models, migrations
│   ├── ui/                  # Shared React components (design system)
│   └── utils/               # Shared TypeScript utilities
├── .claude/
│   ├── agents/              # 10 specialized Claude agents
│   └── skills/              # 3 project management skills
├── tasks/
│   ├── 0001-0020-prd-*.md  # 20 Product Requirements Documents
│   └── tasks-*.md          # 11 detailed task lists
└── infrastructure/
    ├── docker/              # Container configurations
    ├── k8s/                 # Kubernetes/Helm charts
    └── terraform/           # Infrastructure as Code
```

### Technology Stack

**Frontend:**
- Next.js 14 (App Router, Server Components, Server Actions, ISR)
- TypeScript (strict mode)
- Tailwind CSS + Design System (warm coral #FF6B6B primary color)
- React Hook Form, Zod validation
- Storybook for component documentation

**Backend:**
- NestJS (modular architecture: modules, controllers, services, guards)
- PostgreSQL (user data, profiles, search history)
- Redis (caching, sessions, rate limiting)
- Prisma or TypeORM for database ORM

**AI/ML:**
- **Primary Models:** OpenAI GPT-4, Anthropic Claude 3 Opus
- **Fallback Models:** GPT-3.5-turbo, Claude Haiku
- **Orchestration:** LangChain for agent workflows
- **Vector DB:** Pinecone or Weaviate for semantic search
- **Agent Personalities:** Sophie (Warm), Max (Trendy), Elena (Practical), Jordan (Creative)

**Infrastructure:**
- **Build Tool:** Nx workspace (monorepo management)
- **Containerization:** Docker multi-stage builds
- **Orchestration:** Kubernetes with Helm charts
- **CI/CD:** GitHub Actions (lint → test → build → deploy)
- **Monitoring:** Datadog (APM), Sentry (errors), Prometheus/Grafana (infrastructure)

**Testing:**
- **Unit:** Jest (>80% coverage required)
- **Integration:** Supertest with TestContainers
- **E2E:** Playwright
- **Visual Regression:** Percy or Chromatic

## Development Workflow (When Implemented)

### Commands

**Monorepo:**
```bash
# Install dependencies
yarn install

# Run specific app
yarn nx serve web              # Next.js dev server
yarn nx serve api              # NestJS API server

# Testing
yarn nx test <project>         # Run unit tests for project
yarn nx test:watch <project>   # Watch mode
yarn nx test:coverage <project> # Generate coverage report
yarn nx test:e2e web           # Run E2E tests

# Linting & Formatting
yarn nx lint <project>         # ESLint
yarn nx lint:fix <project>     # Auto-fix issues
yarn format                    # Prettier all files

# Building
yarn nx build <project>        # Production build
yarn nx build:all              # Build all projects

# Database
yarn nx prisma:migrate <project> # Run migrations
yarn nx prisma:generate        # Generate Prisma client
yarn nx prisma:studio          # Open Prisma Studio
```

**Docker:**
```bash
# Development
docker-compose up -d           # Start all services
docker-compose logs -f api     # Follow API logs

# Production
docker build -t mykadoo/web -f apps/web/Dockerfile .
docker build -t mykadoo/api -f apps/api/Dockerfile .
```

**Kubernetes:**
```bash
# Deploy to staging
helm upgrade --install mykadoo ./infrastructure/helm/mykadoo \
  --namespace staging --values values-staging.yaml

# Deploy to production
helm upgrade --install mykadoo ./infrastructure/helm/mykadoo \
  --namespace production --values values-production.yaml
```

## Key Architectural Patterns

### AI Agent System (PRD 0013)

Four conversational AI agents with distinct personalities interact with users:
- **Sophie:** Warm & thoughtful (sentimental gifts, family occasions)
- **Max:** Trendy & fun (viral items, teens/young adults)
- **Elena:** Practical & organized (useful gifts, budget-conscious)
- **Jordan:** Creative & quirky (artistic, unconventional finds)

**Multi-Model Strategy:**
- Route complex queries to GPT-4/Claude Opus
- Route simple queries to GPT-3.5/Claude Haiku (cost optimization)
- Automatic fallback on rate limits or failures
- Track cost per conversation, optimize model selection

**Context Management:**
- Store last 10 conversation exchanges
- Maintain user preferences across sessions
- Provide conversation export functionality

### Affiliate Integration (PRD 0003)

**Platforms:**
- Amazon PA-API 5.0 (Priority 1)
- ShareASale (Priority 2)
- CJ Affiliate (Priority 2)

**Data Flow:**
1. Daily product sync via scheduled jobs
2. ETL pipeline standardizes product data
3. Cache frequently viewed products (1hr TTL)
4. Generate tracking links on demand
5. Track clicks and conversions via webhooks

**Link Format Example:**
```
Amazon: https://www.amazon.com/dp/{ASIN}?tag={affiliate-id}
ShareASale: https://shareasale.com/r.cfm?b={banner}&u={affiliate}&m={merchant}
```

### Authentication (PRD 0002)

**JWT Strategy:**
- Access token: 15 min expiry
- Refresh token: 7 days expiry, rotated on use
- HTTP-only, Secure, SameSite cookies

**Social OAuth:**
- Google OAuth 2.0
- Facebook Login
- Account linking on email match

**Security:**
- bcrypt password hashing (cost factor 12)
- Account lockout after 5 failed attempts (15 min)
- Rate limiting: 10 login attempts/min per IP

### Design System (PRD 0015)

**Brand Identity:**
- **Personality:** Warm, friendly, trustworthy
- **Primary Color:** Coral #FF6B6B (warm, inviting)
- **Secondary Color:** Blue #339AF0 (trustworthy)
- **Typography:** Inter (display & body)
- **Spacing:** 8px grid system

**Component Library:**
- Built with React + TypeScript + Tailwind CSS
- Published as `@mykadoo/ui` package
- Documented in Storybook
- WCAG 2.1 AA compliant (4.5:1 contrast minimum)

**Key Components:**
- Buttons (primary, secondary, tertiary, icon)
- Forms (inputs, textarea, select, checkbox, radio, toggle, slider)
- Feedback (alerts, toasts, progress, loading, skeleton, empty states)
- Navigation (header, breadcrumbs, tabs, pagination, sidebar, bottom nav)
- Cards (product, article, profile variants)

## Claude Code Agents

This repository includes 10 specialized agents in `.claude/agents/`:

1. **ai-architect.md** - AI/LLM system design, model selection, prompt engineering
2. **typescript-architect.md** - Type safety, design patterns, code quality
3. **devops-engineer.md** - Infrastructure, Docker, Kubernetes, CI/CD
4. **test-engineer.md** - Testing strategy, Jest, Playwright, coverage
5. **nextjs-specialist.md** - Next.js 14 App Router, Server Components, SSR/ISR
6. **nestjs-specialist.md** - NestJS modules, controllers, services, guards
7. **seo-specialist.md** - SEO optimization, meta tags, structured data, Core Web Vitals
8. **project-manager.md** - Task coordination, KPI definition, quality verification
9. **quality-security-auditor.md** - Dependency updates, vulnerability scanning, OWASP Top 10
10. **ux-specialist.md** - User experience, accessibility, psychological principles

**Usage:** Agents are automatically available. Reference with `@ai-architect` or invoke via Task tool.

## Claude Code Skills

Three project management skills in `.claude/skills/`:

1. **create-prd** - Generate Product Requirements Documents
2. **generate-tasks** - Convert PRDs to actionable task lists
3. **execute-tasks** - Automated task execution with quality gates

**Usage:**
```bash
# Create a new PRD
/create-prd "Feature: Real-time collaboration for wishlists"

# Generate tasks from PRD
/generate-tasks tasks/0001-prd-core-gift-search-ai.md

# Execute tasks automatically
/execute-tasks tasks/tasks-0001-gift-search-ai.md
```

## Product Requirements Documents (PRDs)

**20 comprehensive PRDs** in `tasks/` covering all platform features:

**Phase 1 - MVP:**
- 0001: Core Gift Search & AI Recommendation Engine
- 0002: User Authentication & Profile Management
- 0003: E-commerce Integration & Affiliate Platform
- 0004: Content System & SEO Foundation

**Phase 2 - Growth:**
- 0005: Subscription & Payment System (to be created)
- 0006: CMS with AI Content Curation (to be created)
- 0007: Analytics & User Insights (to be created)
- 0008: Wishlists & Sharing Features (to be created)

**Phase 3 - Scale:**
- 0009: Localization & Multi-Region Support (to be created)
- 0010: Native Mobile Applications (to be created)
- 0011: Social Media Integration (to be created)
- 0012: Customer Support System (to be created)

**Phase 4 - Advanced:**
- 0013: Advanced AI Features & Conversational Agents
- 0014: Performance & Scalability (to be created)

**Foundation (Cross-cutting):**
- 0015: Design System & Brand Identity
- 0016: DevOps, Testing & CI/CD Infrastructure
- 0017: Documentation System
- 0018: Accessibility & Inclusive Design
- 0019: Operational Monitoring & Observability
- 0020: Marketing & Growth Strategy

**Each PRD includes:**
- Problem statement, goals, user stories
- Functional requirements, technical considerations
- Success metrics, acceptance criteria
- Implementation phases, dependencies, risks

## Task Lists

**11 detailed task files** generated from PRDs in `tasks/tasks-*.md`:

Each task list contains:
- **10 parent tasks** with logical grouping
- **8-20 sub-tasks** per parent (actionable, specific)
- **Quality gates** for every parent task:
  - Lint verification (zero warnings)
  - Test suite (all passing, >80% coverage)
  - Build verification (successful compilation)
  - System functionality check (end-to-end)
  - Docker/Helm updates if needed

**Total:** 110 parent tasks, 1,370+ sub-tasks across all PRDs.

**Execution Model:**
- Sub-tasks execute automatically without interruption
- Pause only between parent tasks for confirmation
- Quality gates enforced before moving to next parent

## Quality Standards

### Code Quality
- **Coverage:** >80% for all new code
- **Linting:** Zero warnings/errors (ESLint + Prettier)
- **Type Safety:** TypeScript strict mode, no `any` types
- **Complexity:** Max cyclomatic complexity 10 per function

### Testing
- **Unit Tests:** Jest with React Testing Library
- **Integration Tests:** Supertest with TestContainers (test DB/Redis)
- **E2E Tests:** Playwright for critical user journeys
- **Visual Tests:** Percy/Chromatic for component snapshots

### Accessibility
- **WCAG 2.1 AA** compliance mandatory
- **Color Contrast:** 4.5:1 for text, 3:1 for UI components
- **Keyboard Navigation:** All interactive elements accessible
- **Screen Readers:** ARIA labels, semantic HTML
- **Touch Targets:** 44×44px minimum on mobile

### Performance
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **Bundle Size:** Monitor with webpack-bundle-analyzer
- **API Response:** <500ms p95 latency

### Security
- **OWASP Top 10** coverage required
- **Dependency Scanning:** npm audit, Snyk (weekly)
- **Secret Detection:** No secrets in code/commits
- **Input Validation:** Zod schemas for all user input
- **SQL Injection:** Parameterized queries only
- **XSS Prevention:** Sanitize all user-generated content

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch (auto-deploy to staging)
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Convention
```bash
type(scope): clear summary

Detailed description:
- Key change 1
- Key change 2

Technical notes:
- Implementation details

Completed Task X.Y from PRD [prd-name]

Quality verification:
✅ Lint: 0 warnings
✅ Tests: All passing
✅ Build: Successful
✅ System: Fully functional

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:** feat, fix, docs, style, refactor, test, chore

### Pull Request Requirements
- All CI checks passing (lint, test, build)
- Code coverage ≥80%
- At least 1 approval from code owner
- Branch up-to-date with target
- Zero high/critical vulnerabilities

## Deployment

### Environments
- **Development:** `dev.mykadoo.com` (auto-deploy from `develop`)
- **Staging:** `staging.mykadoo.com` (auto-deploy from `main`)
- **Production:** `mykadoo.com` (manual approval after staging validation)

### Deployment Strategy
- **Blue-Green Deployment:** Zero-downtime releases
- **Gradual Rollout:** 10% → 50% → 100% over 30 minutes
- **Health Checks:** Automatic validation before traffic switch
- **Rollback:** <2 minutes on failure (<2% error rate increase)

### Database Migrations
- **Zero-Downtime:** Additive changes only (backward compatible)
- **Version Controlled:** Prisma migrations in Git
- **Tested:** Run in staging before production
- **Backups:** Automatic backup before production migrations

## Key Implementation Notes

### AI Cost Optimization
- Use GPT-3.5-turbo for simple queries (80% cheaper than GPT-4)
- Cache common AI responses (Redis, 1hr TTL)
- Batch similar requests when possible
- Set per-user monthly AI budget limits
- Track cost per conversation, optimize model selection

### Affiliate Link Compliance
- Display disclosure: "As an Amazon Associate, we earn from qualifying purchases"
- Never mislead about affiliate relationship
- Include proper tracking parameters in all links
- Follow platform TOS strictly (no cookie stuffing)

### User Data Privacy (GDPR)
- Allow data export (JSON format)
- Support account deletion (30-day soft delete)
- Explicit consent for data processing
- Anonymize tracking data
- Log all data access/modifications

### Mobile-First Design
- Design for 320px+ screens first
- Touch targets: 48×48px minimum
- Font size: ≥16px (prevent iOS zoom)
- Test on real devices (iOS Safari, Android Chrome)
- Progressive enhancement for desktop

## Monitoring & Observability

### Key Metrics
- **System Health:** Error rate, latency (p50/p95/p99), throughput
- **Business:** Active users, searches/day, affiliate clicks, conversions
- **AI:** Model usage, cost per search, response quality scores
- **Performance:** Core Web Vitals, API response times, cache hit rates

### Alerting
- **Critical:** Error rate >2%, API latency >1s p95, downtime
- **Warning:** Coverage <80%, failing tests, outdated dependencies
- **Info:** Deployment status, scheduled job completions

### Tools
- **APM:** Datadog (frontend & backend performance)
- **Errors:** Sentry (full stack traces, user context)
- **Logs:** ELK stack (centralized, structured JSON logs)
- **Infrastructure:** Prometheus + Grafana (Kubernetes metrics)
- **Uptime:** 99.9% SLA target

## Current Project Status

**Phase:** Planning & Documentation Complete
**Implementation:** Not yet started

**Completed:**
- ✅ 20 comprehensive PRDs
- ✅ 11 detailed task lists (1,370+ sub-tasks)
- ✅ 10 specialized Claude agents
- ✅ 3 project management skills
- ✅ Git repository initialized

**Next Steps:**
1. Initialize Nx workspace and monorepo structure
2. Set up CI/CD pipeline (PRD 0016, Task 1.0-3.0)
3. Establish design system foundation (PRD 0015, Task 1.0-3.0)
4. Implement core gift search AI (PRD 0001)

**Recommended Start:** Execute `tasks/tasks-0016-devops-cicd.md` first to establish infrastructure, then proceed with design system and MVP features in parallel.
- Whenever a task is finished, it should be marked correspondignly in the file from @tasks/ . Also when a PRD is finished, it should be updated in the PRD file from the @tasks/