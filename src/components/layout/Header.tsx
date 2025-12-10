"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-primary-600">
            UniHub
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/courses"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Courses
            </Link>
            <Link
              href="/marketplace"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Marketplace
            </Link>
            <Link
              href="/tutor/dashboard"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Teach
            </Link>
            <Link
              href="/student/dashboard"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              My Learning
            </Link>
            <Link href="/auth/login" className="btn-primary">
              Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/courses"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/marketplace"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </Link>
            <Link
              href="/tutor/dashboard"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Teach
            </Link>
            <Link
              href="/student/dashboard"
              className="block py-2 text-gray-700 hover:text-primary-600"
              onClick={() => setIsMenuOpen(false)}
            >
              My Learning
            </Link>
            <Link
              href="/auth/login"
              className="block py-2 text-primary-600 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
