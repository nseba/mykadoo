# Docker Setup Guide

This guide explains how to run Mykadoo using Docker and docker-compose.

## Prerequisites

- Docker 20.10+ installed
- Docker Compose 2.0+ installed
- At least 4GB RAM allocated to Docker
- At least 10GB free disk space

## Quick Start

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration values (database passwords, API keys, etc.).

### 2. Start All Services

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- NestJS API on port 3000
- Next.js web app on port 3001

### 3. Check Service Health

```bash
docker-compose ps
```

All services should show as "healthy" or "running".

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
```

### 5. Access the Application

- **Web App**: http://localhost:3001
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Service Details

### PostgreSQL Database

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: mykadoo
- **User**: mykadoo_user
- **Password**: Set in `.env` file

#### Connect to PostgreSQL

```bash
docker-compose exec postgres psql -U mykadoo_user -d mykadoo
```

### Redis Cache

- **Image**: redis:7-alpine
- **Port**: 6379
- **Password**: Set in `.env` file

#### Connect to Redis

```bash
docker-compose exec redis redis-cli -a <your-redis-password>
```

### NestJS API

- **Port**: 3000
- **Health Check**: http://localhost:3000/api/health
- **Swagger Docs**: http://localhost:3000/api

#### Run Migrations

```bash
docker-compose exec api yarn prisma migrate deploy
```

#### Seed Database

```bash
docker-compose exec api yarn prisma db seed
```

### Next.js Web

- **Port**: 3001
- **Dev Mode**: Supports hot reload
- **Health Check**: http://localhost:3001/api/health

## Development Workflow

### Start Services

```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d postgres redis
```

### Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Rebuild Services

```bash
# Rebuild and restart
docker-compose up -d --build

# Rebuild specific service
docker-compose up -d --build api
```

### Execute Commands in Containers

```bash
# Run shell in API container
docker-compose exec api sh

# Run yarn command
docker-compose exec api yarn lint

# Run database migration
docker-compose exec api yarn prisma migrate dev
```

## Production Deployment

### Build Production Images

```bash
# Build API image
docker build -f apps/api/Dockerfile -t mykadoo/api:latest .

# Build Web image
docker build -f apps/web/Dockerfile -t mykadoo/web:latest .
```

### Image Sizes

Target image sizes (with multi-stage builds):
- **API**: < 500MB
- **Web**: < 500MB

Check actual sizes:

```bash
docker images | grep mykadoo
```

### Push to Registry

```bash
# Tag images
docker tag mykadoo/api:latest your-registry.com/mykadoo/api:latest
docker tag mykadoo/web:latest your-registry.com/mykadoo/web:latest

# Push to registry
docker push your-registry.com/mykadoo/api:latest
docker push your-registry.com/mykadoo/web:latest
```

## Troubleshooting

### Service Won't Start

Check logs for the specific service:

```bash
docker-compose logs api
```

### Database Connection Issues

1. Ensure PostgreSQL is healthy:

```bash
docker-compose ps postgres
```

2. Check connection string in `.env` file
3. Verify network connectivity:

```bash
docker-compose exec api ping postgres
```

### Redis Connection Issues

1. Test Redis connectivity:

```bash
docker-compose exec api sh -c 'echo "PING" | nc redis 6379'
```

2. Verify Redis password matches in both `.env` and `docker-compose.yml`

### Build Failures

Clear build cache and rebuild:

```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

### Port Already in Use

Change ports in `.env` file:

```env
API_PORT=3010
WEB_PORT=3011
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Container Out of Memory

Increase Docker memory allocation in Docker Desktop settings.

## Health Checks

All services include health checks:

```yaml
# Check health status
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' mykadoo-api
```

## Security Best Practices

1. **Never commit `.env` file** - It contains secrets
2. **Use strong passwords** in production
3. **Rotate secrets regularly**
4. **Run as non-root user** (already configured in Dockerfiles)
5. **Keep images updated** - Rebuild regularly with latest base images
6. **Scan images for vulnerabilities**:

```bash
docker scan mykadoo/api:latest
```

## Performance Optimization

### Enable BuildKit

```bash
export DOCKER_BUILDKIT=1
docker-compose build
```

### Use Build Cache

```bash
docker-compose build --pull --parallel
```

### Prune Unused Resources

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

## Monitoring

### Resource Usage

```bash
# Real-time stats
docker stats

# Specific service
docker stats mykadoo-api
```

### Container Logs

```bash
# Follow all logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# Specific service
docker-compose logs -f api
```

## Backup and Restore

### Backup Database

```bash
docker-compose exec postgres pg_dump -U mykadoo_user mykadoo > backup.sql
```

### Restore Database

```bash
docker-compose exec -T postgres psql -U mykadoo_user mykadoo < backup.sql
```

### Backup Volumes

```bash
docker run --rm -v mykadoo-postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

## Environment Variables

See `.env.example` for all available environment variables.

Key variables:
- `NODE_ENV` - Environment (development, production)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT signing secret
- `OPENAI_API_KEY` - OpenAI API key
- `CORS_ORIGIN` - Allowed CORS origins

## Docker Compose Profiles

### Development Profile

```bash
docker-compose --profile dev up -d
```

### Production Profile

```bash
docker-compose --profile prod up -d
```

## Multi-Stage Build Details

### Next.js (apps/web/Dockerfile)

1. **deps**: Install dependencies
2. **builder**: Build Next.js application
3. **runner**: Production runtime (< 500MB)

### NestJS (apps/api/Dockerfile)

1. **deps**: Install all dependencies
2. **builder**: Build NestJS application
3. **prod-deps**: Production dependencies only
4. **runner**: Production runtime (< 500MB)

## Networking

Services communicate via `mykadoo-network` bridge network.

Internal DNS resolution:
- `postgres` → PostgreSQL database
- `redis` → Redis cache
- `api` → NestJS API
- `web` → Next.js app

## Volumes

Persistent data volumes:
- `mykadoo-postgres-data` - Database data
- `mykadoo-redis-data` - Cache data

Remove volumes:

```bash
docker-compose down -v
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [NestJS Docker](https://docs.nestjs.com/recipes/dockerfile)

## Support

For issues or questions, please create an issue on the repository.
