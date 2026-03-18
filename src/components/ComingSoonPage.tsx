"use client";

import { useState } from "react";
import Link from "next/link";

interface ComingSoonPageProps {
  title: string;
  description: string;
  email?: string;
  onEmailSubmit?: (email: string) => void;
}

export default function ComingSoonPage({
  title,
  description,
  email: initialEmail = "",
  onEmailSubmit,
}: ComingSoonPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      if (onEmailSubmit) {
        await onEmailSubmit(email);
      }
      setSubmitted(true);
      setEmail("");
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Top Border Accent */}
          <div className="h-1 bg-gradient-to-r from-ocean-500 via-amber-500 to-ocean-500"></div>

          <div className="px-8 md:px-12 py-12 md:py-16 text-center">
            {/* Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-ocean-100 rounded-full">
                <svg
                  className="w-8 h-8 text-ocean-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {title}
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Coming Soon Animated Text */}
            <div className="mb-12">
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-ocean-50 rounded-full border border-ocean-200">
                <div className="w-2 h-2 bg-ocean-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-ocean-700">
                  Coming Soon
                </span>
              </div>
            </div>

            {/* Email Signup */}
            <div className="max-w-md mx-auto mb-8">
              <p className="text-gray-600 mb-4 text-sm">
                Get notified when this feature launches
              </p>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-green-700 font-medium text-sm">
                      Thank you! Check your email for updates.
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-ocean-400 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="px-6 py-3 bg-ocean-600 text-white font-semibold rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isLoading ? "..." : "Notify"}
                  </button>
                </form>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Back Button */}
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-ocean-600 hover:text-ocean-700 font-semibold transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19l-7-7 7-7"
                />
              </svg>
              <span>Back to Home</span>
            </Link>

            {/* Bottom Info */}
            <div className="mt-12 pt-8 border-t border-gray-100">
              <p className="text-gray-500 text-sm">
                We are working hard to bring you the best experience. Stay
                tuned!
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-ocean-500">
            <h3 className="font-semibold text-gray-900 mb-2">Why Wait?</h3>
            <p className="text-sm text-gray-600">
              Sign up to be among the first to access this new feature when it
              launches.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
            <h3 className="font-semibold text-gray-900 mb-2">Keep Learning</h3>
            <p className="text-sm text-gray-600">
              Explore other courses and features available on UniHub right now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
