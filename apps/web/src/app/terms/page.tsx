import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'Read the terms and conditions for using Mykadoo, the AI-powered gift search engine.',
  openGraph: {
    title: 'Terms of Service | Mykadoo',
    description: 'Terms and conditions for using Mykadoo.',
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
          {/* Header */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Last updated: December 28, 2025
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 mb-4">
                By accessing or using Mykadoo, you agree to be bound by these
                Terms of Service and our Privacy Policy. If you do not agree to
                these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-600 mb-4">
                Mykadoo is an AI-powered gift search engine that provides
                personalized gift recommendations. Our service includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>AI-driven gift recommendations based on your preferences</li>
                <li>Product search across multiple retailers</li>
                <li>Wishlist creation and sharing features</li>
                <li>Blog content with gift guides and ideas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-600 mb-4">
                To access certain features, you may need to create an account.
                You agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                4. Subscription Plans
              </h2>
              <p className="text-gray-600 mb-4">
                Mykadoo offers various subscription tiers (Free, Gold, Platinum)
                with different features and limitations. By subscribing to a
                paid plan:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>You authorize us to charge your payment method</li>
                <li>Subscriptions renew automatically unless cancelled</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Price changes will be communicated in advance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                5. Affiliate Disclosure
              </h2>
              <p className="text-gray-600 mb-4">
                Mykadoo participates in affiliate programs, including the Amazon
                Associates Program. When you click on product links and make
                purchases, we may earn a commission at no additional cost to
                you. This helps us maintain and improve our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                6. Acceptable Use
              </h2>
              <p className="text-gray-600 mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>Use the service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Scrape, crawl, or spider our content without permission</li>
                <li>Upload malicious code or content</li>
                <li>Impersonate others or misrepresent your affiliation</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-gray-600 mb-4">
                All content, features, and functionality of Mykadoo, including
                but not limited to text, graphics, logos, and software, are
                owned by Mykadoo and protected by intellectual property laws.
                You may not reproduce, distribute, or create derivative works
                without our express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                8. Disclaimer of Warranties
              </h2>
              <p className="text-gray-600 mb-4">
                Mykadoo is provided &quot;as is&quot; and &quot;as available&quot;
                without warranties of any kind, either express or implied. We do
                not guarantee that:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                <li>The service will be uninterrupted or error-free</li>
                <li>Product information or prices are accurate</li>
                <li>AI recommendations will meet your expectations</li>
                <li>Third-party products will be satisfactory</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-600 mb-4">
                To the fullest extent permitted by law, Mykadoo shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including loss of profits, data, or goodwill,
                arising from your use of the service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                10. Indemnification
              </h2>
              <p className="text-gray-600 mb-4">
                You agree to indemnify and hold harmless Mykadoo and its
                officers, directors, employees, and agents from any claims,
                damages, losses, or expenses arising from your use of the
                service or violation of these terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                11. Termination
              </h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your account and access to the
                service at our sole discretion, without notice, for conduct that
                we believe violates these terms or is harmful to other users,
                us, or third parties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify these terms at any time. We will
                provide notice of significant changes by posting on our website
                or sending you an email. Your continued use of the service
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                13. Governing Law
              </h2>
              <p className="text-gray-600 mb-4">
                These terms shall be governed by and construed in accordance
                with the laws of the jurisdiction in which Mykadoo operates,
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                14. Contact Us
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms of Service, please
                contact us at:
              </p>
              <p className="text-gray-600">
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:legal@mykadoo.com"
                  className="hover:opacity-80"
                  style={{ color: '#FF6B6B' }}
                >
                  legal@mykadoo.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
