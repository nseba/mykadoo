# PRD 0003: E-commerce Affiliate Platform - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Mykadoo e-commerce affiliate platform to production, including all testing requirements, configuration, and monitoring setup.

**Last Updated:** December 8, 2025
**Status:** Ready for Production Deployment

---

## Prerequisites

### Required Accounts

- [ ] Amazon Associates Program account (approved)
- [ ] ShareASale affiliate account (approved, optional)
- [ ] CJ Affiliate account (approved, optional)
- [ ] PostgreSQL database (production instance)
- [ ] Redis cache (production instance)
- [ ] Hosting platform (Vercel, AWS, or similar)
- [ ] Domain name configured
- [ ] SSL certificate installed

### Required Credentials

Obtain the following credentials before deployment:

#### Amazon PA-API 5.0
- `AMAZON_ACCESS_KEY` - Your AWS Access Key
- `AMAZON_SECRET_KEY` - Your AWS Secret Key
- `AMAZON_PARTNER_TAG` - Your Amazon Associate ID
- `AMAZON_HOST` - e.g., `webservices.amazon.com`
- `AMAZON_REGION` - e.g., `us-east-1`

#### ShareASale (Optional)
- `SHAREASALE_AFFILIATE_ID` - Your affiliate ID
- `SHAREASALE_API_TOKEN` - API authentication token
- `SHAREASALE_API_SECRET` - API secret key

#### CJ Affiliate (Optional)
- `CJ_PUBLISHER_ID` - Your publisher/PID
- `CJ_API_TOKEN` - Personal Access Token
- `CJ_WEBSITE_ID` - Your website ID

#### Database & Infrastructure
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host address
- `REDIS_PORT` - Redis port (default: 6379)
- `REDIS_PASSWORD` - Redis authentication password

---

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file with the following:

```env
# Application
NODE_ENV=production
APP_VERSION=1.0.0
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@host:5432/mykadoo?schema=public

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Amazon PA-API
AMAZON_ACCESS_KEY=your-access-key
AMAZON_SECRET_KEY=your-secret-key
AMAZON_PARTNER_TAG=your-associate-id
AMAZON_HOST=webservices.amazon.com
AMAZON_REGION=us-east-1

# ShareASale (Optional)
SHAREASALE_AFFILIATE_ID=your-affiliate-id
SHAREASALE_API_TOKEN=your-api-token
SHAREASALE_API_SECRET=your-api-secret

# CJ Affiliate (Optional)
CJ_PUBLISHER_ID=your-publisher-id
CJ_API_TOKEN=your-api-token
CJ_WEBSITE_ID=your-website-id

# API Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

---

## Database Migration

### 1. Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma migrate deploy

# Verify migration
npx prisma migrate status
```

### 2. Seed Initial Data (Optional)

```bash
npx prisma db seed
```

### 3. Backup Configuration

Set up automatic daily backups for PostgreSQL:

```bash
# Example backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

---

## Build and Deployment

### Option 1: Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL production
vercel env add AMAZON_ACCESS_KEY production
# ... add all required environment variables
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t mykadoo-api:latest -f apps/api/Dockerfile .

# Run container
docker run -d \
  --name mykadoo-api \
  -p 3000:3000 \
  --env-file .env.production \
  mykadoo-api:latest

# Verify health
curl http://localhost:3000/health
```

### Option 3: Kubernetes Deployment

```bash
# Create namespace
kubectl create namespace mykadoo

# Create secrets
kubectl create secret generic mykadoo-secrets \
  --from-env-file=.env.production \
  -n mykadoo

# Deploy application
kubectl apply -f infrastructure/k8s/deployment.yaml -n mykadoo

# Verify deployment
kubectl get pods -n mykadoo
kubectl logs -f deployment/mykadoo-api -n mykadoo
```

---

## Testing Checklist

### Unit Tests

```bash
# Run all unit tests
yarn nx test api

# Run with coverage
yarn nx test api --coverage

# Verify coverage >80%
```

**Expected Results:**
- ✅ All tests passing
- ✅ Coverage ≥80%
- ✅ No critical vulnerabilities

### Integration Tests

```bash
# Run integration tests
yarn nx test:integration api

# Test database connection
yarn nx prisma:studio
```

**Test Scenarios:**
- [ ] Database connectivity
- [ ] Redis connectivity
- [ ] Amazon PA-API calls
- [ ] Product CRUD operations
- [ ] Tracking click recording
- [ ] Analytics aggregation

### E2E Tests (Manual)

#### Product Search Flow

1. Navigate to `/api/affiliate/amazon/search?keywords=gift`
2. Verify response contains products
3. Check product structure (title, price, imageUrl, affiliateLink)
4. Verify affiliate links include partner tag

**Expected:**
- Status 200
- Products array not empty
- All required fields present
- Amazon affiliate link format correct

#### Affiliate Link Click Flow

1. Generate affiliate link: `POST /api/tracking/generate`
2. Record click: `POST /api/tracking/click/:linkId`
3. Verify click record in database
4. Check product click count incremented

**Expected:**
- Link generated successfully
- Click recorded with metadata (IP, user agent)
- Database updated
- Analytics reflect new click

#### Conversion Tracking Flow

1. Record conversion: `POST /api/tracking/conversion`
2. Verify conversion in database
3. Check product metrics updated (conversions, revenue)
4. Validate analytics dashboard shows conversion

**Expected:**
- Conversion recorded
- Commission calculated
- Product revenue updated
- Analytics dashboard accurate

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrated successfully
- [ ] Redis connection verified
- [ ] All API credentials validated
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Health endpoints responding
- [ ] Error monitoring configured (Sentry)
- [ ] APM configured (Datadog)

### Security

- [ ] API keys stored in environment variables (not code)
- [ ] Database uses strong passwords
- [ ] Redis password protected
- [ ] CORS configured for allowed domains
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection verified
- [ ] XSS prevention verified

### Legal & Compliance

- [ ] Amazon Associates Operating Agreement reviewed
- [ ] Affiliate disclosure added to all pages with links
- [ ] Privacy policy updated for affiliate tracking
- [ ] Cookie consent mechanism implemented
- [ ] GDPR compliance verified
- [ ] FTC disclosure requirements met
- [ ] Terms of Service updated

### Monitoring & Alerting

- [ ] Error tracking (Sentry) configured
- [ ] APM (Datadog) configured
- [ ] Health check endpoints:
  - `/health` - Overall health
  - `/health/ready` - Readiness probe
  - `/health/live` - Liveness probe
  - `/health/metrics` - Prometheus metrics
- [ ] Alerts configured:
  - Error rate >2%
  - API latency >1s (p95)
  - Database connection failures
  - Redis connection failures
  - External API failures
- [ ] Dashboard created for key metrics

### Performance

- [ ] Core Web Vitals targets met:
  - LCP <2.5s
  - FID <100ms
  - CLS <0.1
- [ ] API response times <500ms (p95)
- [ ] Database query optimization verified
- [ ] Redis caching strategy implemented
- [ ] CDN configured for static assets
- [ ] Image optimization enabled

### Affiliate Platform Setup

#### Amazon Associates

- [ ] Account approved
- [ ] Partner tag configured
- [ ] PA-API credentials obtained
- [ ] Link format verified: `?tag=your-associate-id`
- [ ] 24-hour cookie attribution window understood
- [ ] Commission rates confirmed

#### ShareASale (Optional)

- [ ] Account approved
- [ ] API credentials obtained
- [ ] Merchant feeds configured
- [ ] Link format verified
- [ ] Postback URL configured
- [ ] Commission tracking tested

#### CJ Affiliate (Optional)

- [ ] Account approved
- [ ] API credentials obtained
- [ ] Advertiser partnerships approved
- [ ] Link format verified
- [ ] Server postback URL configured
- [ ] Conversion tracking tested

---

## Post-Deployment Validation

### Immediate Checks (0-24 hours)

- [ ] Application deployed successfully
- [ ] Health endpoints returning 200
- [ ] No errors in logs
- [ ] Database connections stable
- [ ] Redis connections stable
- [ ] Product search working
- [ ] Affiliate links generating correctly
- [ ] Click tracking functional
- [ ] Analytics dashboard loading

### Short-term Validation (1-7 days)

- [ ] Monitor error rates (<2%)
- [ ] Verify API performance (p95 <500ms)
- [ ] Check affiliate link clicks being tracked
- [ ] Validate sync jobs running (daily, hourly)
- [ ] Confirm cache hit rates >70%
- [ ] Review conversion tracking data
- [ ] Monitor API quota usage
- [ ] Check for security alerts

### Long-term Monitoring (7-30 days)

- [ ] Analyze conversion rates
- [ ] Review commission earnings
- [ ] Optimize product sync strategy
- [ ] Tune cache TTL based on data
- [ ] Review and optimize database queries
- [ ] Analyze user behavior patterns
- [ ] A/B test affiliate link placement
- [ ] Scale infrastructure as needed

---

## Rollback Plan

If issues are detected post-deployment:

1. **Immediate Rollback:**
   ```bash
   # Vercel
   vercel rollback

   # Docker
   docker stop mykadoo-api
   docker run mykadoo-api:previous-version

   # Kubernetes
   kubectl rollout undo deployment/mykadoo-api -n mykadoo
   ```

2. **Database Rollback:**
   ```bash
   # Restore from backup
   psql $DATABASE_URL < backup-YYYYMMDD.sql
   ```

3. **Notify Stakeholders:**
   - Internal team
   - Users (if user-facing impact)
   - Affiliate networks (if tracking affected)

---

## API Quota Management

### Amazon PA-API Limits

- **Rate Limit:** 1 request per second
- **Daily Quota:** Based on revenue (starts at ~8,640 requests/day)
- **Strategy:**
  - Cache responses for 1 hour
  - Batch requests where possible
  - Monitor usage in AWS CloudWatch

### ShareASale Limits

- **Rate Limit:** Varies by endpoint
- **Strategy:**
  - Download feeds once daily
  - Index in local database
  - Query local data, not API

### CJ Affiliate Limits

- **Rate Limit:** Based on tier
- **Strategy:**
  - Cache product search results
  - Use advertiser feeds when available
  - Monitor API usage in dashboard

---

## Monitoring Dashboard

### Key Metrics to Track

**Application Health:**
- Uptime percentage (target: 99.9%)
- Error rate (target: <2%)
- API latency p50, p95, p99
- Database connection pool usage
- Redis cache hit rate

**Business Metrics:**
- Product search volume
- Affiliate link clicks
- Conversion rate
- Revenue per day
- Top performing products
- Platform comparison (Amazon vs ShareASale vs CJ)

**Infrastructure:**
- CPU usage
- Memory usage
- Database connections
- Redis connections
- Network I/O
- Disk usage

---

## Support and Maintenance

### Regular Tasks

**Daily:**
- Review error logs
- Check affiliate link clicks
- Monitor sync job success
- Verify API quota usage

**Weekly:**
- Review conversion data
- Update product feeds
- Check for API updates
- Review security alerts
- Analyze performance trends

**Monthly:**
- Review and optimize queries
- Update dependencies
- Security audit
- Performance optimization
- Backup verification
- Cost analysis

### Emergency Contacts

- **Development Team:** dev@mykadoo.com
- **DevOps:** devops@mykadoo.com
- **Legal:** legal@mykadoo.com
- **Amazon Associates Support:** https://affiliate-program.amazon.com/help/contact
- **ShareASale Support:** support@shareasale.com
- **CJ Affiliate Support:** publishersupport@cj.com

---

## Conclusion

Following this deployment guide ensures a smooth, secure, and compliant production deployment of the Mykadoo e-commerce affiliate platform. All systems should be monitored closely in the first 30 days to identify and resolve any issues quickly.

**Deployment Completed By:** _______________
**Date:** _______________
**Verified By:** _______________
**Date:** _______________

🤖 Generated with [Claude Code](https://claude.com/claude-code)
