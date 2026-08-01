"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        <div className="text-8xl font-black text-gray-200 mb-2 select-none">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8 leading-relaxed">
          The page you were looking for doesn't exist or has been moved.
          Try one of the links below.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Go home
          </Link>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Browse courses
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { href: "/marketplace", label: "Marketplace" },
            { href: "/boarding", label: "Boarding" },
            { href: "/help", label: "Help Centre" },
            { href: "/auth/login", label: "Sign in" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="py-2 px-3 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-400 transition-colors font-medium">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
