# Database Library

Prisma-based database layer for the Mykadoo platform.

## Setup

### Install Dependencies

```bash
yarn add @prisma/client
yarn add -D prisma
```

### Environment Variables

Create a `.env` file in the project root:

```bash
cp libs/database/prisma/.env.example .env
```

Update `DATABASE_URL` with your PostgreSQL connection string.

## Database Commands

### Generate Prisma Client

```bash
yarn prisma generate --schema=libs/database/prisma/schema.prisma
```

### Create Migration

```bash
yarn prisma migrate dev --name <migration-name> --schema=libs/database/prisma/schema.prisma
```

### Apply Migrations

```bash
# Development
yarn prisma migrate dev --schema=libs/database/prisma/schema.prisma

# Production
yarn prisma migrate deploy --schema=libs/database/prisma/schema.prisma
```

### Reset Database

```bash
yarn prisma migrate reset --schema=libs/database/prisma/schema.prisma
```

### Open Prisma Studio

```bash
yarn prisma studio --schema=libs/database/prisma/schema.prisma
```

## Package Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "db:generate": "prisma generate --schema=libs/database/prisma/schema.prisma",
    "db:migrate": "prisma migrate dev --schema=libs/database/prisma/schema.prisma",
    "db:migrate:deploy": "prisma migrate deploy --schema=libs/database/prisma/schema.prisma",
    "db:push": "prisma db push --schema=libs/database/prisma/schema.prisma",
    "db:studio": "prisma studio --schema=libs/database/prisma/schema.prisma",
    "db:seed": "tsx libs/database/prisma/seed.ts"
  }
}
```

## Database Client Usage

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
  },
});

// Find users
const users = await prisma.user.findMany({
  where: {
    status: 'ACTIVE',
  },
  include: {
    profile: true,
  },
});
```

## Schema Overview

### User Management
- **User**: Core user accounts
- **Account**: OAuth provider accounts
- **UserProfile**: Extended user information and preferences

### Subscription & Billing
- **Subscription**: User subscription plans (FREE, GOLD, PLATINUM)

### AI & Search
- **Conversation**: AI chat conversations
- **Message**: Chat messages
- **Search**: Search history
- **SearchResult**: Search result rankings

### Products & Affiliates
- **Product**: Product catalog with affiliate links
- **AffiliateClick**: Click tracking
- **UserEvent**: General event tracking

### Wishlists
- **Wishlist**: User wishlists
- **WishlistItem**: Items in wishlists
- **Favorite**: Favorited products

## Migrations

Migrations are stored in `libs/database/prisma/migrations/`.

### Migration Best Practices

1. **Always test migrations in development first**
2. **Use descriptive migration names**: `add_user_preferences`, `create_products_table`
3. **Review generated SQL** before applying to production
4. **Backup production database** before migrating
5. **Use shadow database** for development migrations
6. **Zero-downtime migrations**: Make additive changes only

### Zero-Downtime Migration Strategy

1. Add new columns/tables (they're ignored if not used)
2. Deploy application code that uses both old and new schema
3. Migrate data from old to new structure
4. Update application to use only new schema
5. Remove old columns/tables in a later migration

## Seeding

Create `libs/database/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test users
  const user = await prisma.user.create({
    data: {
      email: 'test@mykadoo.com',
      name: 'Test User',
      role: 'FREE',
      status: 'ACTIVE',
    },
  });

  console.log('Created user:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
yarn db:seed
```

## Production Deployment

### GitHub Actions

```yaml
- name: Run database migrations
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: yarn db:migrate:deploy
```

### Docker

```dockerfile
# In Dockerfile
RUN yarn prisma generate --schema=libs/database/prisma/schema.prisma

# In docker-compose.yml or K8s init container
command: yarn db:migrate:deploy
```

## Troubleshooting

### Connection Issues

```bash
# Test connection
yarn prisma db pull --schema=libs/database/prisma/schema.prisma
```

### Reset Prisma Client

```bash
rm -rf node_modules/.prisma
yarn db:generate
```

### Migration Conflicts

```bash
# Mark migration as applied without running
yarn prisma migrate resolve --applied <migration-name> --schema=libs/database/prisma/schema.prisma

# Mark migration as rolled back
yarn prisma migrate resolve --rolled-back <migration-name> --schema=libs/database/prisma/schema.prisma
```
