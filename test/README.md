# Testing Infrastructure

Comprehensive testing setup for the Mykadoo monorepo.

## Overview

This directory contains shared testing configuration, utilities, mocks, and fixtures used across all projects in the monorepo.

## Directory Structure

```
test/
├── setup/           # Test setup files
│   └── jest.setup.js
├── mocks/           # Mock modules
│   ├── styleMock.js
│   └── fileMock.js
├── utils/           # Test utilities
│   └── test-utils.tsx
├── fixtures/        # Test data and fixtures
└── README.md        # This file
```

## Testing Stack

### Core Libraries

- **Jest**: Test runner and assertion library
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **jest-axe**: Accessibility testing
- **jest-dom**: Custom Jest matchers for DOM nodes
- **ts-jest**: TypeScript support for Jest

### Additional Tools

- **@nx/jest**: Nx integration for Jest
- **jest-junit**: JUnit XML reporter for CI
- **jest-watch-typeahead**: Interactive watch mode filters

## Running Tests

### All Projects

```bash
# Run all tests
yarn nx run-many --target=test --all

# Run tests in watch mode
yarn nx run-many --target=test --all --watch

# Run tests with coverage
yarn nx run-many --target=test --all --coverage

# Run tests in parallel
yarn nx run-many --target=test --all --parallel=3
```

### Specific Project

```bash
# Run tests for a specific project
yarn nx test <project-name>

# Watch mode
yarn nx test <project-name> --watch

# Coverage
yarn nx test <project-name> --coverage

# Update snapshots
yarn nx test <project-name> --updateSnapshot
```

### Filtered Tests

```bash
# Run tests matching a pattern
yarn nx test <project-name> --testNamePattern="Button"

# Run tests in a specific file
yarn nx test <project-name> --testPathPattern="Button.spec.tsx"

# Run only changed tests
yarn nx affected:test
```

## Writing Tests

### Unit Tests

Place unit tests next to the files they test:

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.spec.tsx  # Unit test
│   │   └── index.ts
```

Example unit test:

```typescript
import { renderWithProviders, testA11y } from '@/test/utils/test-utils';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    const { getByRole } = renderWithProviders(<Button>Click me</Button>);
    expect(getByRole('button')).toHaveTextContent('Click me');
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const { getByRole, user } = renderWithProviders(
      <Button onClick={handleClick}>Click me</Button>
    );

    await user.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible', async () => {
    const { container } = renderWithProviders(<Button>Click me</Button>);
    await testA11y(container);
  });
});
```

### Integration Tests

Place integration tests in a `__tests__` directory:

```
src/
├── features/
│   ├── auth/
│   │   ├── __tests__/
│   │   │   └── login.integration.spec.tsx
│   │   ├── components/
│   │   └── hooks/
```

### E2E Tests

E2E tests are in separate `*-e2e` projects:

```
apps/
├── web-e2e/
│   ├── src/
│   │   └── web.spec.ts
├── api-e2e/
│   ├── src/
│   │   └── api.spec.ts
```

## Test Utilities

### `renderWithProviders`

Renders components with all necessary providers:

```typescript
import { renderWithProviders } from '@/test/utils/test-utils';

const { getByRole, user } = renderWithProviders(<MyComponent />, {
  route: '/custom-route', // Optional: set initial route
});
```

### `testA11y`

Tests accessibility with jest-axe:

```typescript
import { testA11y } from '@/test/utils/test-utils';

it('is accessible', async () => {
  const { container } = renderWithProviders(<MyComponent />);
  await testA11y(container);
});
```

### `mockRouter`

Mocks Next.js router:

```typescript
import { mockRouter } from '@/test/utils/test-utils';

jest.mock('next/router', () => ({
  useRouter: () => mockRouter({
    pathname: '/custom-path',
    query: { id: '123' },
  }),
}));
```

### `createMockFile`

Creates mock files for file input testing:

```typescript
import { createMockFile } from '@/test/utils/test-utils';

const file = createMockFile('test.jpg', 1024, 'image/jpeg');
```

## Best Practices

### 1. Test Structure

Follow the AAA pattern (Arrange, Act, Assert):

```typescript
it('calculates total price correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];

  // Act
  const total = calculateTotal(items);

  // Assert
  expect(total).toBe(30);
});
```

### 2. Test Naming

Use descriptive test names:

```typescript
// ✅ Good
it('displays error message when email is invalid')
it('calls onSubmit with form data when form is valid')

// ❌ Bad
it('works')
it('test email')
```

### 3. User-Centric Testing

Test from the user's perspective:

```typescript
// ✅ Good - test behavior
const { getByLabelText, getByRole, user } = renderWithProviders(<LoginForm />);
await user.type(getByLabelText(/email/i), 'test@example.com');
await user.click(getByRole('button', { name: /submit/i }));

// ❌ Bad - test implementation
const { container } = renderWithProviders(<LoginForm />);
const input = container.querySelector('#email-input');
fireEvent.change(input, { target: { value: 'test@example.com' } });
```

### 4. Accessibility Testing

Always test accessibility:

```typescript
it('is accessible', async () => {
  const { container } = renderWithProviders(<MyComponent />);
  await testA11y(container);
});
```

### 5. Avoid Implementation Details

Test what the user sees, not how it works internally:

```typescript
// ✅ Good
expect(getByRole('button')).toBeDisabled();

// ❌ Bad
expect(component.state.isDisabled).toBe(true);
```

### 6. Clean Up

Use cleanup utilities to prevent test pollution:

```typescript
afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});
```

### 7. Mock External Dependencies

Mock API calls, timers, and external services:

```typescript
jest.mock('@/lib/api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'John' })),
}));
```

### 8. Use Snapshots Sparingly

Snapshots are useful but can be brittle:

```typescript
// ✅ Good - snapshot critical UI
it('renders error state correctly', () => {
  const { container } = renderWithProviders(<ErrorBoundary error={error} />);
  expect(container).toMatchSnapshot();
});

// ❌ Bad - snapshot everything
expect(component).toMatchSnapshot();
```

## Coverage Requirements

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory.

### View Coverage

```bash
# Generate coverage report
yarn nx test <project-name> --coverage

# Open HTML report
open coverage/<project-name>/index.html
```

## CI/CD Integration

Tests run automatically on:

- **Pull Requests**: All tests must pass
- **Commits to main/develop**: Full test suite + coverage check
- **Pre-commit hook**: Changed files only (optional)

### CI Test Command

```bash
yarn nx run-many --target=test --all --coverage --ci
```

## Troubleshooting

### Tests Failing Locally But Passing in CI

1. Clear Jest cache: `yarn jest --clearCache`
2. Delete node_modules and reinstall: `rm -rf node_modules && yarn install`
3. Check for local environment variables affecting tests

### Slow Tests

1. Use `--maxWorkers=50%` to limit parallel execution
2. Mock expensive operations (API calls, timers)
3. Use `jest.setTimeout(10000)` for slow tests only
4. Consider splitting large test suites

### Memory Issues

1. Increase Node memory: `NODE_OPTIONS=--max-old-space-size=4096 yarn test`
2. Run tests in smaller batches
3. Use `--runInBand` to run tests serially

### Flaky Tests

1. Avoid timing-dependent tests
2. Use `waitFor` for async operations
3. Mock timers with `jest.useFakeTimers()`
4. Ensure proper cleanup between tests

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library Documentation](https://testing-library.com/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://testingjavascript.com/)
