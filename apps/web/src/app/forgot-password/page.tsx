import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password',
  description:
    'Reset your Mykadoo password. Enter your email address and we will send you a link to reset your password.',
  openGraph: {
    title: 'Forgot Password | Mykadoo',
    description: 'Reset your Mykadoo password.',
  },
};

export default function ForgotPasswordPage() {
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
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              No worries! Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          {/* Form */}
          <form
            action="/api/auth/forgot-password"
            method="POST"
            className="space-y-4"
          >
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:border-coral-500 focus:ring-coral-500 transition-colors"
                placeholder="you@example.com"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              Send reset link
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
