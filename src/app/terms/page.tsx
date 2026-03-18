"use client";

import Link from "next/link";
import { Button } from "@/components/ui";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              ← Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: March 18, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8 space-y-8">
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using UniHub, you accept and agree to be bound by
              the terms and provision of this agreement. If you do not agree to
              abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Use License
            </h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily download one copy of the
              materials (information or software) on UniHub for personal,
              non-commercial transitory viewing only. This is the grant of a
              license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Modify or copy the materials</li>
              <li>
                Use the materials for any commercial purpose or for any public
                display
              </li>
              <li>
                Attempt to decompile or reverse engineer any software contained
                on the site
              </li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>
                Transferring the materials to another person or "mirroring" the
                materials on any other server
              </li>
              <li>Violating any laws or engaging in any conduct that is illegal</li>
            </ul>
          </section>

          {/* User Content */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Content
            </h2>
            <p className="text-gray-700 mb-4">
              You retain all rights to any content you submit, post or display on
              or through the service. By submitting content, you grant UniHub a
              worldwide, non-exclusive, royalty-free license to use that content.
            </p>
            <p className="text-gray-700">
              You agree not to submit content that is unlawful, threatening,
              abusive, libelous, defamatory, obscene, or otherwise objectionable.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Intellectual Property Rights
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All course materials, videos, documents, and other content provided
              by tutors and instructors on UniHub are protected by copyright and
              other intellectual property laws. Unauthorized reproduction, modification,
              or distribution of this content is prohibited.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. User Accounts
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                When you create an account with UniHub, you must provide accurate,
                current, and complete information.
              </p>
              <p>
                You are responsible for maintaining the confidentiality of your
                password and for all activities that occur under your account.
              </p>
              <p>
                You agree to notify UniHub immediately of any unauthorized use of
                your account or any other breach of security.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              The materials on UniHub are provided on an 'as is' basis. UniHub
              makes no warranties, expressed or implied, and hereby disclaims and
              negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular
              purpose, or non-infringement of intellectual property or other
              violation of rights.
            </p>
          </section>

          {/* Disclaimer */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Disclaimer
            </h2>
            <p className="text-gray-700 leading-relaxed">
              In no event shall UniHub or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit,
              or due to business interruption) arising out of the use or inability
              to use the materials on UniHub.
            </p>
          </section>

          {/* Modifications */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Modifications to Service and Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              UniHub may revise these terms of service for our website at any time
              without notice. By using this website, you are agreeing to be bound
              by the then current version of these terms of service.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These terms and conditions are governed by and construed in
              accordance with the laws of Sri Lanka, and you irrevocably submit
              to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded">
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
        </div>

        {/* Footer Links */}
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/">
            <Button variant="outline">Home</Button>
          </Link>
          <Link href="/privacy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
