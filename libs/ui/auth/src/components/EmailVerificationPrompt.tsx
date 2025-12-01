'use client';

/**
 * Email Verification Prompt Component
 *
 * Prompts users to verify their email address and allows resending verification
 */

export interface EmailVerificationPromptProps {
  email: string;
  onResendVerification: () => Promise<void>;
  isLoading?: boolean;
  successMessage?: string;
  error?: string;
}

export function EmailVerificationPrompt({
  email,
  onResendVerification,
  isLoading = false,
  successMessage,
  error,
}: EmailVerificationPromptProps) {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-coral-100 mb-4">
          <svg className="h-6 w-6 text-coral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification link to
          </p>
          <p className="mt-1 text-sm font-medium text-gray-900">{email}</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-6 space-y-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-coral-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-700">
              Click the link in the email to verify your account
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-coral-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-700">
              The link will expire in 24 hours
            </p>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-coral-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-700">
              Check your spam folder if you don't see the email
            </p>
          </div>
        </div>

        {/* Resend Button */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-3">
            Didn't receive the email?
          </p>
          <button
            type="button"
            onClick={onResendVerification}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-coral-600 hover:bg-coral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coral-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending...
              </>
            ) : (
              'Resend verification email'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
