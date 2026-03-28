"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button, RoleUpgradeModal, NotificationBell } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [requiredRole, setRequiredRole] = useState<RoleType | null>(null);
  const { user, logout, isAuthenticated, switchRole } = useAuth();
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
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileOpen]);

  // Dynamically determine the dashboard link based on user role
  const getDashboardLink = () => {
    if (!isAuthenticated || !user) {
      return {
        href: "/student/dashboard",
        label: "My Learning",
        requiresRole: null,
      };
    }

    if (user.primaryRole === "tutor") {
      return {
        href: "/tutor/dashboard",
        label: "My Teaching",
        requiresRole: null,
      };
    }

    return {
      href: "/student/dashboard",
      label: "My Learning",
      requiresRole: null,
    };
  };

  const navLinks = [
    { href: "/courses", label: "Courses", requiresRole: null },
    // Only show "Teach" tab if user is NOT already a tutor
    ...(user?.roles?.includes("tutor")
      ? []
      : [
          {
            href: "/tutor/dashboard",
            label: "Teach",
            requiresRole: "tutor" as RoleType,
          },
        ]),
    { href: "/marketplace", label: "Marketplace", requiresRole: null },
    { href: "/boarding", label: "Boarding", requiresRole: null },
    getDashboardLink(),
  ];

  const handleNavClick = (e: React.MouseEvent, link: (typeof navLinks)[0]) => {
    if (!isAuthenticated) {
      // Not logged in - proceed to page (auth will redirect to login)
      return;
    }

    // Check if this link requires a specific role
    if (link.requiresRole) {
      const userRoles = user?.roles || [];
      const hasRole = userRoles.includes(link.requiresRole);

      if (!hasRole) {
        e.preventDefault();
        setRequiredRole(link.requiresRole);
        setRoleModalOpen(true);
        return;
      }

      // Tutor-specific check - show modal for both "not approved yet" and "already tutor" scenarios
      if (link.requiresRole === "tutor") {
        e.preventDefault();
        setRequiredRole("tutor");
        setRoleModalOpen(true);
        return;
      }
    }
  };

  return (
    <header
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "shadow-lg backdrop-blur-sm bg-white/95" : "shadow-md"
      }`}
      suppressHydrationWarning
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
                onClick={(e) => handleNavClick(e, link)}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* User Menu / Auth */}
            <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-gray-200">
              {isAuthenticated && user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      console.log(
                        "Profile clicked, current state:",
                        isProfileOpen,
                      );
                      setIsProfileOpen(!isProfileOpen);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ocean-500 to-ocean-600 flex items-center justify-center text-white font-semibold">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {user.primaryRole}
                      </div>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      {/* Current Mode Display */}
                      {user && (
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Current Mode
                          </p>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                user.primaryRole === "student"
                                  ? "bg-blue-500"
                                  : user.primaryRole === "tutor"
                                    ? "bg-green-500"
                                    : "bg-purple-500"
                              }`}
                            ></div>
                            <span className="text-sm font-medium text-gray-900 capitalize">
                              {user.primaryRole === "student" && "Student"}
                              {user.primaryRole === "tutor" && "Tutor"}
                              {user.primaryRole === "admin" && "Admin"}
                              {user.primaryRole === "vendor" && "Vendor"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Role Switcher - Show only if user has multiple roles */}
                      {user && user.roles && user.roles.length > 1 && (
                        <>
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                              Switch Mode
                            </p>
                            <div className="space-y-1">
                              {user.roles.includes("student") && (
                                <button
                                  onClick={async () => {
                                    if (user.primaryRole !== "student") {
                                      const result =
                                        await switchRole("student");
                                      if (result.success) {
                                        router.push("/student/dashboard");
                                        setIsProfileOpen(false);
                                      }
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    user.primaryRole === "student"
                                      ? "bg-blue-50 text-blue-700 font-medium"
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    Student
                                  </span>
                                  {user.primaryRole === "student" && (
                                    <svg
                                      className="w-4 h-4 text-blue-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </button>
                              )}
                              {user.roles.includes("tutor") && (
                                <button
                                  onClick={async () => {
                                    if (user.primaryRole !== "tutor") {
                                      const result = await switchRole("tutor");
                                      if (result.success) {
                                        router.push("/tutor/dashboard");
                                        setIsProfileOpen(false);
                                      }
                                    }
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    user.primaryRole === "tutor"
                                      ? "bg-green-50 text-green-700 font-medium"
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    Tutor
                                  </span>
                                  {user.primaryRole === "tutor" && (
                                    <svg
                                      className="w-4 h-4 text-green-600"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          Settings
                        </span>
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                          router.push("/");
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <span className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Log Out
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-navy-800 hover:text-ocean-600"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 border-0"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
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
                  className="block py-3 px-4 rounded-lg text-gray-700 hover:bg-ocean-50 hover:text-ocean-600 transition-all font-medium"
                  onClick={(e) => {
                    handleNavClick(e, link);
                    setIsMenuOpen(false);
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Notifications in Mobile Menu */}
            {isAuthenticated && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="px-4 text-sm font-semibold text-gray-600 mb-3">
                  Notifications
                </h3>
                <div className="px-4">
                  <NotificationBell />
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t space-y-3">
              {!isAuthenticated && (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-ocean-400 text-ocean-600 hover:bg-ocean-50"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Button
                      variant="primary"
                      className="w-full bg-gradient-to-r from-ocean-500 to-ocean-600 hover:from-ocean-600 hover:to-ocean-700 border-0"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Role Upgrade Modal */}
      {requiredRole && (
        <RoleUpgradeModal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          roleType={requiredRole}
          featureName={
            navLinks.find((l) => l.requiresRole === requiredRole)?.label
          }
        />
      )}
    </header>
  );
}
