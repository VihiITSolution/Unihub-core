"use client";

import { Button } from "@/components/ui";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Button href="/" variant="outline" className="mb-4">← Back to Home</Button>
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: March 18, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        <div className="bg-white rounded-lg shadow p-4 sm:p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              UniHub ("we", "our", or "us") operates the UniHub learning management
              platform. This page informs you of our policies regarding the
              collection, use, and disclosure of personal data when you use our
              service and the choices you have associated with that data.
            </p>
          </section>

          {/* Information Collection and Use */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Information Collection and Use
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Account Information
                </h3>
                <p>
                  We collect information you provide directly, including name,
                  email address, educational background, and profile information
                  when you create an account or update your profile.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Learning Data
                </h3>
                <p>
                  We collect information about your interactions with courses,
                  including completion status, assessments, and learning
                  progress.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Usage Information
                </h3>
                <p>
                  We automatically collect information about your device, browser
                  type, IP address, pages visited, and time spent on pages to
                  improve our service.
                </p>
              </div>
            </div>
          </section>

          {/* Use of Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Use of Data
            </h2>
            <p className="text-gray-700 mb-4">UniHub uses the collected data for:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Providing, maintaining, and improving our services</li>
              <li>
                Notifying you about changes to our service or policies
              </li>
              <li>Allowing you to participate in interactive features</li>
              <li>Providing technical support and responding to inquiries</li>
              <li>Analyzing usage patterns to enhance user experience</li>
              <li>Enforcing our Terms of Service and other agreements</li>
            </ul>
          </section>

          {/* YouTube Integration */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              YouTube Integration
            </h2>
            <p className="text-gray-700 leading-relaxed">
              UniHub integrates with YouTube Data API to host educational videos.
              When tutors upload videos, they are uploaded to YouTube as unlisted
              content. We store the YouTube video ID for access control. Your use
              of YouTube videos is also subject to Google's Privacy Policy.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access, alteration,
              disclosure, or destruction. However, no method of transmission over
              the Internet is 100% secure.
            </p>
          </section>

          {/* User Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request deletion of your data</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to opt-out of marketing communications</li>
            </ul>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us at:
            </p>
            <div className="mt-4 bg-gray-100 p-4 rounded">
              <p className="text-gray-800">
                <strong>Email:</strong> support@unihub.lk
              </p>
              <p className="text-gray-800">
                <strong>Website:</strong>{" "}
                <a
                  href="https://unihub.lk"
                  className="text-blue-600 hover:underline"
                >
                  https://unihub.lk
                </a>
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify
              you of any changes by posting the new policy on this page and
              updating the "Last updated" date.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Button href="/" variant="outline">Home</Button>
          <Button href="/terms" variant="outline">Terms of Service</Button>
        </div>
      </div>
    </div>
  );
}
