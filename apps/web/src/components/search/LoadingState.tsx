'use client';

/**
 * Loading State Component
 *
 * Display while AI generates recommendations
 * Uses ARIA live region to announce loading status to screen readers
 * Respects prefers-reduced-motion with static alternative
 */

export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading gift recommendations"
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="relative">
        {/* Animated Spinner - hidden for reduced motion users */}
        <div
          className="w-16 h-16 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin motion-reduce:hidden"
          aria-hidden="true"
        ></div>

        {/* Static loading indicator for reduced motion users */}
        <div
          className="hidden motion-reduce:block w-16 h-16 border-4 border-coral-500 rounded-full"
          aria-hidden="true"
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-coral-500 text-xs font-medium">...</span>
          </div>
        </div>

        {/* Icon in center - only shown with animations */}
        <div className="absolute inset-0 flex items-center justify-center motion-reduce:hidden" aria-hidden="true">
          <svg
            className="w-6 h-6 text-coral-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
      </div>

      <p className="mt-6 text-lg font-medium text-gray-700">Finding perfect gifts...</p>
      <p className="mt-2 text-sm text-gray-500">AI is analyzing your preferences</p>

      {/* Loading messages with animated indicators */}
      <div className="mt-8 space-y-2 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          {/* Animated dot - hidden for reduced motion */}
          <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce motion-reduce:hidden" aria-hidden="true"></div>
          {/* Static indicator for reduced motion */}
          <div className="hidden motion-reduce:block w-2 h-2 bg-coral-500 rounded-full" aria-hidden="true"></div>
          <span>Analyzing recipient profile</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce motion-reduce:hidden" aria-hidden="true"></div>
          <div className="hidden motion-reduce:block w-2 h-2 bg-blue-500 rounded-full" aria-hidden="true"></div>
          <span>Searching product database</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce motion-reduce:hidden" aria-hidden="true"></div>
          <div className="hidden motion-reduce:block w-2 h-2 bg-coral-500 rounded-full" aria-hidden="true"></div>
          <span>Personalizing recommendations</span>
        </div>
      </div>
    </div>
  );
}
