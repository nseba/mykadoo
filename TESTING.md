# Testing Guide

Comprehensive guide for writing and running tests in the Mykadoo monorepo.

## Overview

We use a multi-layered testing approach:
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Supertest + TestContainers
- **E2E Tests**: Playwright
- **Visual Regression**: Percy (optional)
- **Accessibility**: jest-axe

## Quick Start

```bash
# Run all tests
yarn test

# Run tests for specific project
yarn nx test web
yarn nx test api

# Run with coverage
yarn nx test web --coverage

# Watch mode
yarn nx test web --watch

# E2E tests
yarn nx e2e web-e2e
```

## Unit Testing

### React Components

```typescript
import { render, screen, userEvent } from '@/test/utils/render';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const { user } = renderWithUserEvent(
      <Button onClick={handleClick}>Click me</Button>
    );
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### NestJS Services

```typescript
import { Test } from '@nestjs/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [SearchService],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should search for gifts', async () => {
    const result = await service.search({
      occasion: 'birthday',
      budgetMin: 50,
      budgetMax: 100,
    });

    expect(result.recommendations).toHaveLength(10);
  });
});
```

## Integration Testing

### API Endpoints

```typescript
import { INestApplication } from '@nestjs/common';
import { createTestApp, api, expectResponse } from '@/test/utils/api';
import { AppModule } from './app.module';

describe('SearchController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp(AppModule);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/search returns recommendations', async () => {
    const response = await api.post(app, '/api/search', {
      occasion: 'birthday',
      relationship: 'friend',
      budgetMin: 50,
      budgetMax: 100,
    });

    expectResponse.success(response);
    expect(response.body).toHaveProperty('recommendations');
    expect(response.body.recommendations).toHaveLength(10);
  });
});
```

### Database Tests

```typescript
import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
  getPrismaClient,
} from '@/test/utils/database';

describe('User Repository', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('creates a user', async () => {
    const prisma = getPrismaClient();
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: 'hashed',
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

## E2E Testing

### Playwright Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Gift Search Flow', () => {
  test('should search for gifts and display results', async ({ page }) => {
    await page.goto('/');
    
    // Fill search form
    await page.fill('[name="occasion"]', 'birthday');
    await page.fill('[name="budgetMin"]', '50');
    await page.fill('[name="budgetMax"]', '100');
    await page.click('button[type="submit"]');
    
    // Wait for results
    await page.waitForSelector('[data-testid="gift-card"]');
    
    // Verify results
    const giftCards = await page.locator('[data-testid="gift-card"]').count();
    expect(giftCards).toBeGreaterThan(0);
  });

  test('should handle authentication flow', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Test Organization

```
apps/
  api/
    src/
      search/
        search.service.ts
        search.service.spec.ts      # Unit test
      __tests__/
        search.e2e.spec.ts          # Integration test
  web/
    src/
      components/
        Button/
          Button.tsx
          Button.spec.tsx            # Component test
    __tests__/
      search.e2e.spec.ts            # E2E test via API
      
test/
  utils/                             # Shared utilities
  fixtures/                          # Test data
  helpers/                           # Test helpers
```

## Coverage Requirements

Minimum coverage thresholds (enforced):
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

View coverage:
```bash
yarn test --coverage
open coverage/lcov-report/index.html
```

## Best Practices

### 1. Arrange-Act-Assert Pattern

```typescript
it('calculates total price', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

### 2. Test Naming

```typescript
// Good
it('returns empty array when no items exist', () => {});
it('throws error when price is negative', () => {});

// Bad
it('works', () => {});
it('test 1', () => {});
```

### 3. Mock External Dependencies

```typescript
jest.mock('./api-client', () => ({
  fetchGifts: jest.fn(() => Promise.resolve([])),
}));
```

### 4. Use Test IDs

```typescript
// Component
<button data-testid="submit-button">Submit</button>

// Test
screen.getByTestId('submit-button')
```

### 5. Avoid Implementation Details

```typescript
// Good - test behavior
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();

// Bad - test implementation
expect(container.querySelector('.btn-submit')).toBeInTheDocument();
```

## Continuous Integration

Tests run automatically on:
- Every push to main/develop
- Every pull request
- Before deployment

CI configuration:
```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: yarn nx affected --target=test --base=origin/main --coverage
```

## Debugging Tests

### VS Code

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${file}"],
  "console": "integratedTerminal"
}
```

### Chrome DevTools

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Performance

- Use `jest.mock()` for external dependencies
- Avoid unnecessary `beforeEach` setup
- Use `test.only` to run single test during development
- Parallel execution: `jest --maxWorkers=4`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [jest-axe](https://github.com/nickcolley/jest-axe)

