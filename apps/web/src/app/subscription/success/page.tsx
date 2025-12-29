import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Subscription Successful',
  description: 'Welcome to your new Mykadoo subscription!',
  robots: { index: false, follow: false },
};

export default function SubscriptionSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-10 w-10 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="mt-6 text-3xl font-bold text-gray-900">
          Welcome to Premium!
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Your subscription is now active. You have full access to all premium
          features.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/search"
            className="block w-full rounded-lg bg-coral-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-coral-700"
          >
            Start Searching
          </Link>

          <Link
            href="/account/subscription"
            className="block w-full rounded-lg border-2 border-gray-200 px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            Manage Subscription
          </Link>
        </div>

        <div className="mt-8 rounded-lg bg-coral-50 p-4">
          <h2 className="font-semibold text-coral-800">What&apos;s included:</h2>
          <ul className="mt-2 space-y-1 text-sm text-coral-700">
            <li>Unlimited AI-powered gift searches</li>
            <li>Advanced personalized recommendations</li>
            <li>Priority customer support</li>
            <li>Ad-free experience</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
