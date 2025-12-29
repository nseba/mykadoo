import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Checkout Canceled',
  description: 'Your subscription checkout was canceled.',
  robots: { index: false, follow: false },
};

export default function SubscriptionCancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-10 w-10 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Checkout Canceled
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          No worries! Your subscription checkout was canceled and you haven&apos;t
          been charged.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/pricing"
            className="block w-full rounded-lg bg-coral-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-coral-700"
          >
            View Plans Again
          </Link>

          <Link
            href="/"
            className="block w-full rounded-lg border-2 border-gray-200 px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            Go to Home
          </Link>
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Have questions?{' '}
          <Link href="/contact" className="text-coral-500 hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </div>
  );
}
