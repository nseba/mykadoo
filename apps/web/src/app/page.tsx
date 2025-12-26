import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Find the{' '}
              <span className="text-coral-500" style={{ color: '#FF6B6B' }}>
                Perfect Gift
              </span>
              <br />
              with AI
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              Mykadoo uses intelligent AI agents to help you discover thoughtful,
              personalized gift ideas for everyone on your list. No more gift-giving stress.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/search"
                className="rounded-full bg-coral-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-coral-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-600 transition-colors"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Start Searching
              </Link>
              <Link
                href="/blog"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
              >
                Read Our Blog <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How Mykadoo Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our AI-powered platform makes gift finding effortless
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100" style={{ backgroundColor: '#FFE8E8' }}>
                  <svg className="h-6 w-6" style={{ color: '#FF6B6B' }} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Tell Us About Them
                </h3>
                <p className="mt-2 text-gray-600">
                  Share details about who you&apos;re shopping for - their interests, age, occasion, and budget.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  AI Finds Ideas
                </h3>
                <p className="mt-2 text-gray-600">
                  Our AI agents analyze thousands of products to find personalized recommendations just for you.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">
                  Shop with Confidence
                </h3>
                <p className="mt-2 text-gray-600">
                  Browse curated gift ideas with real reviews and easy purchase links to top retailers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden rounded-3xl px-6 py-16 sm:px-16 sm:py-24 text-center" style={{ backgroundColor: '#FF6B6B' }}>
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to find the perfect gift?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/90">
              Start your AI-powered gift search today. It&apos;s free to try!
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/search"
                className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                style={{ color: '#FF6B6B' }}
              >
                Start Free Search
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-semibold leading-6 text-white hover:text-white/80"
              >
                View Pricing <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: '#FF6B6B' }}>
                Mykadoo
              </span>
            </div>
            <nav className="flex gap-8">
              <Link href="/search" className="text-sm text-gray-600 hover:text-gray-900">
                Search
              </Link>
              <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">
                Blog
              </Link>
              <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
            </nav>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Mykadoo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
