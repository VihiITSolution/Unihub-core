import Link from "next/link";

export const metadata = { title: "Cookie Policy — UniHub" };

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
  </section>
);

const COOKIES = [
  { name: "unihub_token", type: "Essential", duration: "30 days", purpose: "Keeps you signed in to your account." },
  { name: "unihub_role", type: "Essential", duration: "30 days", purpose: "Remembers whether you're in student or tutor mode." },
  { name: "unihub_notif_prefs", type: "Functional", duration: "Persistent", purpose: "Stores your notification preferences locally." },
  { name: "unihub_privacy_prefs", type: "Functional", duration: "Persistent", purpose: "Stores your privacy settings locally." },
  { name: "_ga, _gid", type: "Analytics", duration: "Up to 2 years", purpose: "Google Analytics — helps us understand how the platform is used." },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back to Home</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-3">Cookie Policy</h1>
          <p className="text-gray-500 mt-1 text-sm">Last updated: July 2026</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-white rounded-lg shadow p-4 sm:p-8">

          <Section title="What Are Cookies?">
            <p>
              Cookies are small text files stored on your device when you visit a website.
              They allow the site to remember your preferences and actions over time, so you
              don't have to re-enter information each visit.
            </p>
          </Section>

          <Section title="How UniHub Uses Cookies">
            <p>UniHub uses cookies for three purposes:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Essential cookies</strong> — required for the platform to function (login, session management).</li>
              <li><strong>Functional cookies</strong> — remember your preferences (notification settings, privacy choices).</li>
              <li><strong>Analytics cookies</strong> — help us understand how visitors use the site so we can improve it.</li>
            </ul>
            <p>We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="Cookies We Use">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                    <th className="text-left px-4 py-3 border-b border-gray-200">Cookie</th>
                    <th className="text-left px-4 py-3 border-b border-gray-200">Type</th>
                    <th className="text-left px-4 py-3 border-b border-gray-200">Duration</th>
                    <th className="text-left px-4 py-3 border-b border-gray-200">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {COOKIES.map((c) => (
                    <tr key={c.name} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-800">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                          c.type === "Essential" ? "bg-green-100 text-green-800" :
                          c.type === "Functional" ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>{c.type}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{c.duration}</td>
                      <td className="px-4 py-3 text-gray-600">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Managing Cookies">
            <p>
              You can control and delete cookies through your browser settings. Please note that
              disabling essential cookies will prevent you from signing in to UniHub.
            </p>
            <p>
              Most browsers allow you to refuse cookies or to delete cookies that have already been set.
              The methods for doing so vary between browsers; please refer to your browser's help documentation.
            </p>
          </Section>

          <Section title="Third-Party Cookies">
            <p>
              Some pages on UniHub embed content from third-party services (e.g. YouTube for course videos,
              Google Analytics for usage statistics). These services may set their own cookies.
              UniHub does not control these cookies; please refer to the respective privacy policies:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Google / YouTube Privacy Policy</a></li>
            </ul>
          </Section>

          <Section title="Changes to This Policy">
            <p>
              We may update this Cookie Policy from time to time. The date at the top of the page
              reflects the date of the most recent revision. We encourage you to review this page
              periodically.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              If you have questions about our use of cookies, contact us at{" "}
              <a href="mailto:support@unihub.lk" className="text-green-700 hover:underline">support@unihub.lk</a>{" "}
              or visit our <Link href="/help" className="text-green-700 hover:underline">Help Centre</Link>.
            </p>
          </Section>

        </div>
      </div>
    </div>
  );
}
