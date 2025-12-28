# Multi-stage Dockerfile for NestJS API
# Target image size: < 500MB

# Stage 1: Dependencies
FROM node:20-alpine AS deps

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc ./
COPY .yarn ./.yarn

# Install dependencies
RUN yarn install --frozen-lockfile --production=false

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Copy NestJS app specific files
COPY apps/api ./apps/api

# Set environment to production
ENV NODE_ENV=production

# Generate Prisma client before building
RUN yarn db:generate

# Build NestJS application using Nx
RUN yarn nx build api --prod

# Stage 3: Production dependencies
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Copy package files
COPY package.json yarn.lock .yarnrc ./
COPY .yarn ./.yarn

# Install production dependencies only
RUN yarn install --frozen-lockfile --production=true

# Stage 4: Runner (Production)
FROM node:20-alpine AS runner

WORKDIR /app

# Set to production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application from builder
COPY --from=builder /app/dist/apps/api ./dist

# Set correct permissions
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 14001

# Set port environment variable
ENV PORT=14001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:14001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start NestJS application
CMD ["node", "dist/main.js"]
