/**
 * Custom Render Utilities
 * 
 * Provides enhanced render functions with common providers and utilities
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';

/**
 * Create a new QueryClient for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * All the providers wrapper
 */
interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
  const client = queryClient || createTestQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Custom render that includes providers
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: CustomRenderOptions
): RenderResult {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders queryClient={queryClient}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

/**
 * Render with user event
 */
export function renderWithUserEvent(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return {
    user: userEvent.setup(),
    ...renderWithProviders(ui, options),
  };
}

/**
 * Wait for loading to complete
 */
export async function waitForLoadingToFinish() {
  const { waitForElementToBeRemoved } = await import('@testing-library/react');
  const loader = document.querySelector('[data-testid="loading"]');
  if (loader) {
    await waitForElementToBeRemoved(loader);
  }
}

// Re-export everything from testing library
export * from '@testing-library/react';
export { userEvent };
