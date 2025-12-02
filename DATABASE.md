# Database Guide

Comprehensive guide for database management, migrations, and seeding in the Mykadoo platform.

## Overview

**Database:** PostgreSQL 16
**ORM:** Prisma
**Schema Location:** `libs/database/prisma/schema.prisma`
**Migrations:** `libs/database/prisma/migrations/`
**Seeds:** `libs/database/prisma/seeds/`

## Quick Start

```bash
# Generate Prisma Client
yarn db:generate

# Create a new migration
yarn db:migrate

# Apply migrations to production
yarn db:migrate:deploy

# Reset database (development only!)
yarn db:migrate:reset

# Seed the database
yarn db:seed

# Open Prisma Studio (GUI)
yarn db:studio

# Push schema changes without migration (development)
yarn db:push
```

## Database Schema

The Mykadoo database consists of 23 models covering:

### User Management
- **User**: Core user accounts with authentication
- **Account**: OAuth provider accounts (Google, Facebook)
- **UserProfile**: User preferences and settings
- **EmailVerificationToken**: Email confirmation tokens
- **PasswordResetToken**: Password reset tokens

### Subscriptions
- **Subscription**: User subscription plans (Free, Gold, Platinum)

### AI Conversations
- **Conversation**: User conversation sessions with AI agents
- **Message**: Individual messages in conversations

### Gift Search
- **Search**: Search queries and parameters
- **SearchResult**: Individual products returned in searches
- **RecipientProfile**: Saved recipient profiles

### Products & Wishlists
- **Product**: E-commerce products from affiliates
- **Wishlist**: User-created wishlists
- **WishlistItem**: Products in wishlists
- **Favorite**: User favorite products

### Affiliate Tracking
- **AffiliateClick**: Tracked clicks on affiliate links
- **Commission**: Earned affiliate commissions

### Analytics & Feedback
- **UserFeedback**: User ratings and feedback on recommendations
- **SearchAnalytics**: Aggregated search metrics
- **ProductPerformance**: Product recommendation performance

### Content
- **Article**: SEO blog articles

## Migration Workflow

### Development Environment

**Creating a Migration:**

```bash
# Make changes to schema.prisma
# Then create a migration
yarn db:migrate

# Prisma will prompt for a migration name
# Example: "add_user_preferences"
```

This will:
1. Generate SQL migration files
2. Apply the migration to your development database
3. Update Prisma Client

**Best Practices:**
- Always review generated SQL before committing
- Test migrations on a copy of production data
- Keep migrations small and focused
- Use descriptive migration names

**Testing Migrations:**

```bash
# Reset database and reapply all migrations
yarn db:migrate:reset

# Seed with test data
yarn db:seed

# Verify everything works
```

### Production Deployments

**Zero-Downtime Migration Strategy:**

1. **Additive Changes Only** (Initial Phase)
   - Add new tables/columns
   - Make new columns nullable or with defaults
   - Deploy application code that works with both old and new schema

2. **Deploy New Code**
   - Application now uses new columns/tables
   - Old columns/tables still present

3. **Data Migration** (if needed)
   - Backfill data into new columns
   - Use background jobs for large tables

4. **Remove Old Schema** (Separate Deployment)
   - Drop unused columns/tables
   - Only after confirming new code is stable

**Example: Renaming a Column**

❌ **BAD** (Breaking change):
```prisma
model User {
  id    String @id
  // name  String  // Removed
  fullName String  // Added
}
```

✅ **GOOD** (Zero-downtime approach):

**Step 1:** Add new column
```prisma
model User {
  id       String @id
  name     String  // Keep old
  fullName String? // Add new (nullable)
}
```

**Step 2:** Deploy code that writes to both columns

**Step 3:** Backfill data
```sql
UPDATE "User" SET "fullName" = "name" WHERE "fullName" IS NULL;
```

**Step 4:** Make new column required
```prisma
model User {
  id       String @id
  name     String  // Keep old
  fullName String  // Now required
}
```

**Step 5:** Deploy code that only uses fullName

**Step 6:** Remove old column
```prisma
model User {
  id       String @id
  fullName String
}
```

### Deploying Migrations to Production

**Manual Deployment:**

```bash
# 1. Backup database first!
# (Automated in CI/CD)

# 2. Apply pending migrations
yarn db:migrate:deploy

# 3. Verify application health
curl https://api.mykadoo.com/health
```

**Automated CI/CD:**

GitHub Actions automatically runs migrations during deployment:

```yaml
- name: Run Database Migration
  run: yarn db:migrate:deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}

- name: Verify Migration
  run: |
    # Check database is accessible
    # Verify critical tables exist
    # Run smoke tests
```

## Database Seeding

### Development Seeds

The seed script creates realistic test data:

**Users:**
- `admin@mykadoo.com` - Admin user
- `gold@mykadoo.com` - Gold subscriber
- `user@mykadoo.com` - Free user

**Password:** `Test123!@#` (for all users)

**Additional Data:**
- 2 recipient profiles
- 3 sample products
- 1 wishlist with items
- Search history
- User feedback

**Running Seeds:**

```bash
# Seed the database
yarn db:seed

# Reset and seed
yarn db:migrate:reset --skip-seed
yarn db:seed
```

### Production Seeds

Production seeding is minimal and includes only:
- Initial admin account
- Configuration data
- Reference data (categories, etc.)

**Never seed user data or test data to production.**

### Creating Custom Seeds

Add additional seed files in `libs/database/prisma/seeds/`:

```typescript
// libs/database/prisma/seeds/categories.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedCategories() {
  await prisma.category.createMany({
    data: [
      { name: 'Electronics', slug: 'electronics' },
      { name: 'Home & Garden', slug: 'home-garden' },
      // ...
    ],
  });
}
```

Import in main seed file:

```typescript
// libs/database/prisma/seeds/seed.ts
import { seedCategories } from './categories';

async function main() {
  await seedCategories();
  // ...
}
```

## Backup & Recovery

### Automated Backups

**Production:**
- Daily full backups (3:00 AM UTC)
- Hourly incremental backups
- Retention: 30 days
- Stored in S3 with encryption

**Staging:**
- Daily backups
- Retention: 7 days

### Manual Backup

```bash
# Backup production database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup with compression
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore from Backup

```bash
# Restore from backup file
psql $DATABASE_URL < backup_20250103_120000.sql

# Restore from compressed backup
gunzip -c backup_20250103_120000.sql.gz | psql $DATABASE_URL
```

### Point-in-Time Recovery

Production uses PostgreSQL Write-Ahead Logging (WAL) for point-in-time recovery:

```bash
# Restore to specific timestamp
# (Requires database admin access)
pg_restore --timestamp="2025-01-03 12:00:00" backup.tar
```

## Rollback Procedures

### Application Rollback

If a deployment with migrations fails:

1. **Rollback Application Code** (immediate)
   ```bash
   kubectl rollout undo deployment/api
   ```

2. **Assess Database State**
   - If migration was additive (new columns/tables), no rollback needed
   - If migration was destructive, restore from backup

3. **Restore Database** (if needed)
   ```bash
   # Stop application
   kubectl scale deployment/api --replicas=0

   # Restore backup
   psql $DATABASE_URL < backup_before_migration.sql

   # Restart application with old code
   kubectl scale deployment/api --replicas=3
   ```

### Migration Rollback

Prisma doesn't support automatic migration rollback. Manual rollback:

```bash
# 1. Identify the migration to rollback
ls libs/database/prisma/migrations/

# 2. Create a new migration that reverses changes
yarn db:migrate

# 3. Manually write SQL to undo the previous migration
# Example: If previous migration added a column, drop it
```

**Best Practice:** Test rollback procedures in staging before production deployments.

## Performance Optimization

### Indexes

**Automatic Indexes:**
- Prisma creates indexes for `@id`, `@unique`, and `@@unique` fields

**Custom Indexes:**

```prisma
model Product {
  id    String @id
  title String
  price Float

  @@index([price]) // Add index for price queries
  @@index([title(ops: raw("gin_trgm_ops"))], type: Gin) // Full-text search
}
```

**Check Missing Indexes:**

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- Find tables without indexes on foreign keys
SELECT ...
```

### Query Optimization

**Use `select` to limit fields:**

```typescript
// ❌ Fetches all fields
const users = await prisma.user.findMany();

// ✅ Only fetch needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    name: true,
  },
});
```

**Use `include` wisely:**

```typescript
// ❌ N+1 query problem
const users = await prisma.user.findMany();
for (const user of users) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });
}

// ✅ Single query with join
const users = await prisma.user.findMany({
  include: {
    profile: true,
  },
});
```

### Connection Pooling

**Prisma Connection Pool:**

```env
# .env
DATABASE_URL="postgresql://user:pass@localhost:5432/mykadoo?connection_limit=10"
```

**Production Recommendations:**
- API instances: 5-10 connections each
- Total: (number of instances) × (connection limit) < max_connections
- PostgreSQL default max_connections: 100

**External Connection Pooler (PgBouncer):**

```env
DATABASE_URL="postgresql://user:pass@pgbouncer:6432/mykadoo"
DIRECT_URL="postgresql://user:pass@postgres:5432/mykadoo"
```

## Monitoring

### Key Metrics

**Query Performance:**
- Slow query log (queries > 1 second)
- Query execution time (p50, p95, p99)
- Connection pool utilization

**Database Health:**
- Active connections
- Database size
- Table sizes
- Index usage
- Cache hit ratio (>95%)

### Prisma Query Logging

**Development:**

```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

**Production:**

```typescript
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration,
    });
  }
});
```

### Database Monitoring Tools

- **Datadog:** APM and database monitoring
- **pg_stat_statements:** Query performance analysis
- **PgHero:** Database insights (queries, indexes, bloat)
- **Sentry:** Error tracking for database errors

## Security

### Connection Security

**SSL/TLS:**

```env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**IAM Authentication (AWS RDS):**

```typescript
import { DefaultAzureCredential } from '@azure/identity';

// Use IAM token instead of password
const token = await getAuthToken();
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `postgresql://user:${token}@host:5432/db`,
    },
  },
});
```

### Access Control

**Principle of Least Privilege:**

```sql
-- Application user (read/write)
CREATE USER app_user WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- Read-only user (for analytics)
CREATE USER analytics_user WITH PASSWORD 'strong_password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Migration user (DDL operations)
CREATE USER migration_user WITH PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO migration_user;
```

### Sensitive Data

**Encryption at Rest:**
- Use database encryption (AWS RDS, Azure SQL, etc.)
- Encrypt backups

**Field-Level Encryption:**

```typescript
// For highly sensitive data (SSN, credit cards)
import { encrypt, decrypt } from '@/lib/encryption';

const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    ssn: encrypt(ssn), // Encrypt before storing
  },
});

// Decrypt when reading
const decryptedSSN = decrypt(user.ssn);
```

## CI/CD Integration

### GitHub Actions Workflow

```yaml
jobs:
  database-migration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_DB: mykadoo_test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Generate Prisma Client
        run: yarn db:generate

      - name: Run migrations
        run: yarn db:migrate:deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/mykadoo_test

      - name: Seed database
        run: yarn db:seed

      - name: Run tests
        run: yarn test
```

### Pre-deployment Checks

```bash
# In CI/CD pipeline before deploying

# 1. Backup database
./scripts/backup-database.sh

# 2. Check pending migrations
yarn db:migrate:status

# 3. Run migration in dry-run mode
yarn db:migrate:deploy --dry-run

# 4. Apply migrations
yarn db:migrate:deploy

# 5. Smoke tests
./scripts/smoke-tests.sh

# 6. Monitor for errors
# If errors > threshold, rollback
```

## Troubleshooting

### Common Issues

**Issue:** "Prepared statement already exists"
**Solution:** Restart application or clear Prisma query cache

**Issue:** "Too many connections"
**Solution:** Reduce connection_limit in DATABASE_URL or add connection pooler

**Issue:** "Relation does not exist"
**Solution:** Run `yarn db:generate` and `yarn db:migrate:deploy`

**Issue:** Migration fails in production
**Solution:** Check migration logs, verify database permissions, restore from backup if needed

### Debug Mode

```bash
# Enable Prisma debug logging
DEBUG=prisma:* yarn db:migrate

# Enable query logging
DEBUG=prisma:query yarn db:migrate
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Migration Guide](https://www.prisma.io/docs/guides/migrate)
- [Zero-Downtime Migrations](https://www.prisma.io/dataguide/types/relational/migration-strategies)
- [Database Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
