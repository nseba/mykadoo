'use client';

/**
 * Error State Component
 *
 * Display error messages with ARIA live region for immediate screen reader announcement
 * Uses role="alert" and aria-live="assertive" for urgent notifications
 */

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const errorMessage = message || 'We encountered an error while searching for gifts. Please try again.';

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="flex flex-col items-center justify-center py-12"
    >
      {/* Error Icon */}
      <div
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
        aria-hidden="true"
      >
        <svg
          className="w-8 h-8 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* Error Message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        {errorMessage}
      </p>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-coral-600 text-white font-medium rounded-md hover:bg-coral-700 transition-colors"
        >
          Try Again
        </button>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-400 mt-6">
        If the problem persists, please contact support
      </p>
    </div>
  );
}
