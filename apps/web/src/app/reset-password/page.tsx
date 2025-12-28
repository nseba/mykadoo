import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description:
    'Create a new password for your Mykadoo account.',
  openGraph: {
    title: 'Reset Password | Mykadoo',
    description: 'Create a new password for your Mykadoo account.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-6 text-center">
            <a
              href="/"
              className="inline-block text-3xl font-bold mb-4"
              style={{ color: '#FF6B6B' }}
            >
              Mykadoo
            </a>
            <h1 className="text-2xl font-bold text-gray-900">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form
            action="/api/auth/reset-password"
            method="POST"
            className="space-y-4"
          >
            {/* Hidden token field */}
            <input type="hidden" name="token" value={token || ''} />

            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-coral-500 focus:ring-coral-500 transition-colors"
                placeholder="Create a strong password"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-coral-500 focus:ring-coral-500 transition-colors"
                placeholder="Confirm your new password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              Reset password
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <a
              href="/login"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
