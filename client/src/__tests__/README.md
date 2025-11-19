# Testing Guide

This directory contains test files for the 12-Step Recovery Companion app.

## Test Structure

```
__tests__/
├── setup.ts              # Test environment setup and global mocks
├── utils.tsx             # Test utilities and helpers
├── routes/               # Route/screen component tests
│   ├── Home.test.tsx
│   ├── Onboarding.test.tsx
│   ├── Steps.test.tsx
│   ├── Journal.test.tsx
│   └── Emergency.test.tsx
├── integration/          # Integration tests for critical flows
│   ├── onboarding-flow.test.tsx
│   └── step-work-flow.test.tsx
└── components/          # Component tests (existing)
    ├── SafetyPlanBuilder.test.tsx
    └── ConnectionFlow.test.tsx
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- Home.test.tsx
```

## Test Utilities

### `renderWithProviders`

Renders a component with all necessary providers (QueryClient, etc.) and mocked store.

```tsx
import { renderWithProviders } from '../utils';

const { queryClient, mockState } = renderWithProviders(<MyComponent />, {
  storeOverrides: {
    profile: { name: 'Test User' },
  },
});
```

### `createMockStoreState`

Creates a mock store state for testing.

```tsx
import { createMockStoreState } from '../utils';

const mockState = createMockStoreState({
  onboardingComplete: true,
  profile: { name: 'Test User' },
});
```

### `mockRouter`

Mocks wouter router for testing navigation.

```tsx
import { mockRouter } from '../utils';

const { mockSetLocation } = mockRouter('/home');
```

## Writing Tests

### Component Tests

Test individual components in isolation:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test critical user flows:

```tsx
import { describe, it, expect } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../utils';
import App from '@/App';

describe('Onboarding Flow', () => {
  it('should complete onboarding', async () => {
    renderWithProviders(<App />, {
      storeOverrides: { onboardingComplete: false },
    });

    // Simulate user interactions
    fireEvent.click(screen.getByText('Get Started'));
    
    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });
});
```

## Mocking

### Mocking the Store

The store is automatically mocked in `renderWithProviders`. Override specific parts:

```tsx
renderWithProviders(<Component />, {
  storeOverrides: {
    profile: { name: 'Custom Name' },
    updateProfile: vi.fn(),
  },
});
```

### Mocking External Dependencies

Mock external dependencies at the top of your test file:

```tsx
vi.mock('@/lib/contentLoader', () => ({
  loadAllSteps: vi.fn(() => Promise.resolve({})),
}));
```

## Best Practices

1. **Test Behavior, Not Implementation**: Test what users see and do, not internal implementation details.

2. **Use Descriptive Test Names**: Test names should clearly describe what is being tested.

3. **Arrange-Act-Assert**: Structure tests with clear sections:
   - Arrange: Set up test data and mocks
   - Act: Perform the action being tested
   - Assert: Verify the expected outcome

4. **Test Critical Flows**: Focus on testing critical user journeys:
   - Onboarding → Home → First entry
   - Step work completion
   - Journal entry creation
   - Emergency tools usage
   - Data export/import

5. **Mock External Dependencies**: Mock API calls, external libraries, and browser APIs.

6. **Clean Up**: Use `afterEach` to clean up mocks and state between tests.

7. **Accessibility**: Test keyboard navigation and screen reader compatibility.

## Common Patterns

### Testing Async Operations

```tsx
it('should load data asynchronously', async () => {
  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```tsx
import userEvent from '@testing-library/user-event';

it('should handle user input', async () => {
  const user = userEvent.setup();
  renderWithProviders(<Component />);
  
  const input = screen.getByLabelText('Name');
  await user.type(input, 'Test User');
  
  expect(input).toHaveValue('Test User');
});
```

### Testing Navigation

```tsx
import { mockRouter } from '../utils';

it('should navigate on button click', () => {
  const { mockSetLocation } = mockRouter('/');
  renderWithProviders(<Component />);
  
  fireEvent.click(screen.getByText('Go to Home'));
  
  expect(mockSetLocation).toHaveBeenCalledWith('/home');
});
```

## Coverage Goals

- **Unit Tests**: 70%+ coverage for business logic
- **Integration Tests**: All critical flows covered
- **Component Tests**: Key components tested

## Troubleshooting

### Tests failing with "Cannot find module"

Ensure all dependencies are installed:
```bash
npm install
```

### Tests timing out

Increase timeout for slow tests:
```tsx
it('slow test', async () => {
  // ... test code
}, { timeout: 10000 });
```

### Mock not working

Ensure mocks are defined before imports:
```tsx
vi.mock('@/store/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

import { useAppStore } from '@/store/useAppStore';
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Testing Library React](https://testing-library.com/react)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

