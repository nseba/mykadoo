'use client';

/**
 * Loading State Component
 *
 * Display while AI generates recommendations
 */

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {/* Spinner */}
        <div className="w-16 h-16 border-4 border-coral-200 border-t-coral-500 rounded-full animate-spin"></div>

        {/* Icon in center */}
        <div className="absolute inset-0 flex items-center justify-center">
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

      {/* Loading messages */}
      <div className="mt-8 space-y-2 text-center">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce"></div>
          <span>Analyzing recipient profile</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 animation-delay-200">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <span>Searching product database</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 animation-delay-400">
          <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce"></div>
          <span>Personalizing recommendations</span>
        </div>
      </div>
    </div>
  );
}
