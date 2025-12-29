import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | Mykadoo',
  description:
    'Our commitment to digital accessibility. Learn about our WCAG 2.1 AA compliance efforts and how to report accessibility issues.',
};

export default function AccessibilityPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Accessibility Statement
        </h1>

        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-gray-600 mb-8">
            Mykadoo is committed to ensuring digital accessibility for people
            with disabilities. We are continually improving the user experience
            for everyone and applying the relevant accessibility standards.
          </p>

          <section aria-labelledby="conformance-status">
            <h2
              id="conformance-status"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Conformance Status
            </h2>
            <p className="text-gray-600 mb-4">
              The Web Content Accessibility Guidelines (WCAG) defines
              requirements for designers and developers to improve accessibility
              for people with disabilities. It defines three levels of
              conformance: Level A, Level AA, and Level AAA.
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Mykadoo</strong> is <strong>partially conformant</strong>{' '}
              with WCAG 2.1 Level AA. Partially conformant means that some parts
              of the content do not fully conform to the accessibility standard.
            </p>
          </section>

          <section aria-labelledby="accessibility-features">
            <h2
              id="accessibility-features"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Accessibility Features
            </h2>
            <p className="text-gray-600 mb-4">
              We have implemented the following accessibility features:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Keyboard Navigation:</strong> All interactive elements
                can be accessed using keyboard only. Skip links are provided to
                bypass repetitive content.
              </li>
              <li>
                <strong>Screen Reader Support:</strong> We use semantic HTML and
                ARIA landmarks to ensure compatibility with screen readers like
                VoiceOver, NVDA, and JAWS.
              </li>
              <li>
                <strong>Color Contrast:</strong> Text and interactive elements
                meet WCAG 2.1 AA contrast requirements (4.5:1 for normal text,
                3:1 for large text).
              </li>
              <li>
                <strong>Focus Indicators:</strong> Clear visual focus indicators
                are provided for all interactive elements.
              </li>
              <li>
                <strong>Reduced Motion:</strong> Animations are reduced or
                disabled for users who have enabled &quot;reduce motion&quot; in
                their system settings.
              </li>
              <li>
                <strong>Mobile Accessibility:</strong> Touch targets meet the
                44x44 pixel minimum size requirement. Pinch-to-zoom is enabled.
              </li>
              <li>
                <strong>Alternative Text:</strong> All meaningful images include
                descriptive alt text. Decorative images are marked appropriately.
              </li>
              <li>
                <strong>Form Accessibility:</strong> Form fields have associated
                labels, error messages are announced to screen readers, and
                validation instructions are provided.
              </li>
              <li>
                <strong>Live Regions:</strong> Dynamic content updates (search
                results, loading states, errors) are announced to assistive
                technologies.
              </li>
            </ul>
          </section>

          <section aria-labelledby="known-limitations">
            <h2
              id="known-limitations"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Known Limitations
            </h2>
            <p className="text-gray-600 mb-4">
              Despite our best efforts, there may be some limitations. Below are
              known accessibility limitations:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Third-party content:</strong> Product images and
                descriptions from affiliate partners may not have alt text that
                meets our standards.
              </li>
              <li>
                <strong>User-generated content:</strong> Content submitted by
                users may not always be accessible.
              </li>
              <li>
                <strong>Complex data visualizations:</strong> Some charts and
                graphs may not be fully accessible to screen reader users. We
                are working to provide text alternatives.
              </li>
            </ul>
          </section>

          <section aria-labelledby="assistive-technologies">
            <h2
              id="assistive-technologies"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Compatibility with Assistive Technologies
            </h2>
            <p className="text-gray-600 mb-4">
              Mykadoo is designed to be compatible with the following assistive
              technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>VoiceOver on macOS and iOS</li>
              <li>NVDA on Windows</li>
              <li>JAWS on Windows</li>
              <li>TalkBack on Android</li>
              <li>Browser zoom functionality (up to 200%)</li>
              <li>High contrast mode</li>
              <li>Screen magnification software</li>
            </ul>
          </section>

          <section aria-labelledby="technical-specifications">
            <h2
              id="technical-specifications"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Technical Specifications
            </h2>
            <p className="text-gray-600 mb-4">
              Accessibility of Mykadoo relies on the following technologies to
              work:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>HTML</li>
              <li>WAI-ARIA</li>
              <li>CSS</li>
              <li>JavaScript</li>
            </ul>
            <p className="text-gray-600 mb-4">
              These technologies are relied upon for conformance with the
              accessibility standards used.
            </p>
          </section>

          <section aria-labelledby="assessment-approach">
            <h2
              id="assessment-approach"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Assessment Approach
            </h2>
            <p className="text-gray-600 mb-4">
              Mykadoo assessed the accessibility of this website using the
              following approaches:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Self-evaluation using automated testing tools (axe-core, Lighthouse)</li>
              <li>Manual testing with screen readers</li>
              <li>Keyboard-only navigation testing</li>
              <li>Color contrast analysis</li>
              <li>Continuous integration accessibility testing</li>
            </ul>
          </section>

          <section aria-labelledby="feedback">
            <h2
              id="feedback"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Feedback and Contact Information
            </h2>
            <p className="text-gray-600 mb-4">
              We welcome your feedback on the accessibility of Mykadoo. Please
              let us know if you encounter accessibility barriers:
            </p>
            <ul className="list-none pl-0 text-gray-600 space-y-2 mb-4">
              <li>
                <strong>Email:</strong>{' '}
                <a
                  href="mailto:accessibility@mykadoo.com"
                  className="text-coral-600 hover:text-coral-700 underline"
                >
                  accessibility@mykadoo.com
                </a>
              </li>
              <li>
                <strong>Response time:</strong> We try to respond to
                accessibility feedback within 5 business days.
              </li>
            </ul>
          </section>

          <section aria-labelledby="enforcement">
            <h2
              id="enforcement"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Enforcement Procedure
            </h2>
            <p className="text-gray-600 mb-4">
              If you are not satisfied with our response to your accessibility
              concern, you may escalate to our accessibility coordinator or file
              a complaint with the appropriate regulatory body in your
              jurisdiction.
            </p>
          </section>

          <section aria-labelledby="date">
            <h2
              id="date"
              className="text-2xl font-semibold text-gray-900 mt-8 mb-4"
            >
              Date
            </h2>
            <p className="text-gray-600 mb-4">
              This statement was created on December 29, 2024, using the{' '}
              <a
                href="https://www.w3.org/WAI/planning/statements/"
                className="text-coral-600 hover:text-coral-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                W3C Accessibility Statement Generator Tool
              </a>
              .
            </p>
            <p className="text-gray-600">
              <strong>Last reviewed:</strong> December 29, 2024
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
