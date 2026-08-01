import Link from "next/link";

export const metadata = { title: "Accessibility — UniHub" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Accessibility Statement</h1>
          <p className="text-gray-500 mt-1 text-sm">Last updated: July 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-white rounded-lg shadow p-4 sm:p-8 space-y-2">

          <Section title="Our Commitment">
            <p>
              UniHub is committed to ensuring digital accessibility for people with disabilities.
              We continually improve the user experience for everyone and apply the relevant
              accessibility standards to our platform.
            </p>
          </Section>

          <Section title="Conformance Status">
            <p>
              We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1 Level AA</strong>.
              These guidelines explain how to make web content more accessible to people with disabilities.
              Conformance with these guidelines helps make the web more user-friendly for everyone.
            </p>
            <p>
              UniHub is <strong>partially conformant</strong> with WCAG 2.1 Level AA.
              Partially conformant means that some parts of the content do not fully conform to the accessibility standard.
            </p>
          </Section>

          <Section title="What We've Done">
            <ul className="list-disc pl-5 space-y-2">
              <li>All images include descriptive alt text.</li>
              <li>The site can be navigated using a keyboard alone.</li>
              <li>Text can be resized up to 200% without loss of content or functionality.</li>
              <li>Colour contrast ratios meet the WCAG 2.1 AA minimum standard of 4.5:1 for normal text.</li>
              <li>Interactive elements have visible focus indicators.</li>
              <li>Forms include labels associated with their inputs.</li>
              <li>Videos uploaded to courses are hosted on YouTube, which provides built-in caption support.</li>
            </ul>
          </Section>

          <Section title="Known Limitations">
            <p>Despite our efforts, some content may not yet fully meet accessibility standards:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Some older PDF course materials may not be fully accessible to screen readers.</li>
              <li>Live session video streams rely on third-party platforms whose accessibility support varies.</li>
              <li>Some complex data tables on vendor and admin dashboards may not have full ARIA markup.</li>
            </ul>
            <p>We are actively working to address these limitations.</p>
          </Section>

          <Section title="Technical Specifications">
            <p>UniHub relies on the following technologies for conformance with WCAG 2.1:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>HTML5</li>
              <li>CSS (Tailwind CSS)</li>
              <li>JavaScript / React (Next.js)</li>
              <li>WAI-ARIA where applicable</li>
            </ul>
          </Section>

          <Section title="Supported Browsers and Assistive Technologies">
            <p>UniHub is designed to work with the following browsers and assistive technologies:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Chrome, Firefox, Safari, and Edge (latest two major versions)</li>
              <li>NVDA and JAWS screen readers on Windows</li>
              <li>VoiceOver on macOS and iOS</li>
              <li>TalkBack on Android</li>
            </ul>
          </Section>

          <Section title="Feedback and Contact">
            <p>
              We welcome your feedback on the accessibility of UniHub. If you experience any barriers
              not listed on this page, or think we are not meeting accessibility requirements, please contact us:
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm">
              <p><strong>Email:</strong>{" "}
                <a href="mailto:support@unihub.lk" className="text-green-700 hover:underline">support@unihub.lk</a>
              </p>
              <p className="mt-1"><strong>Help Centre:</strong>{" "}
                <Link href="/help" className="text-green-700 hover:underline">unihub.lk/help</Link>
              </p>
              <p className="mt-2 text-gray-500">We aim to respond to accessibility feedback within 2 business days.</p>
            </div>
          </Section>

          <Section title="Enforcement Procedure">
            <p>
              If you are not satisfied with our response, you may contact the{" "}
              <strong>Information and Communication Technology Agency of Sri Lanka (ICTA)</strong>{" "}
              for further assistance.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
