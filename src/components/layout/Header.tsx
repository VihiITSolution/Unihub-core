"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  const navLinks = [
    { href: "/courses", label: "Courses" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/tutor/dashboard", label: "Teach" },
    { href: "/student/dashboard", label: "My Learning" },
  ];

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-lg backdrop-blur-sm bg-white/95" : "shadow-md"
      }`}
    >
      <nav className="container-custom">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 transform group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/Unihub.webp"
                alt="UniHub Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-navy-900 to-navy-700 bg-clip-text text-transparent">
                UniHub
              </span>
              <span className="text-xs text-amber-600 font-medium tracking-wider">
                LEARN. EARN. GROW.
              </span>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-ocean-400 to-amber-400 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity blur-sm -z-10" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-ocean-400 transition-all bg-gray-50 focus:bg-white"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-ocean-500 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-all duration-200 font-medium"
              >
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-ocean-600 transition-colors hover-glow rounded-lg">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="notification-badge">3</span>
            </button>

            {/* User Menu / Auth */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm" className="text-navy-800 hover:text-ocean-600">
                  Login
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="primary" size="sm" className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 border-0">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-7 h-7 text-gray-700"
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

        {/* Mobile Search */}
        <div className="lg:hidden py-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:ring-0 focus:border-ocean-400 bg-gray-50 focus:bg-white transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4 border-t mt-2 pt-4 animate-slide-down">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t space-y-3">
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full border-ocean-400 text-ocean-600 hover:bg-ocean-50">
                  Login
                </Button>
              </Link>

            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

