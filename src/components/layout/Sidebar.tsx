"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userType?: "student" | "tutor" | "admin";
}

export default function Sidebar({
  isOpen,
  onToggle,
  userType = "student",
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const studentLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/courses", label: "Browse Courses", icon: "courses" },
    { href: "/student/my-courses", label: "My Courses", icon: "book" },
    { href: "/student/live-sessions", label: "Live Sessions", icon: "video" },
    { href: "/student/bodima", label: "Bodima", icon: "home" },
    { href: "/marketplace", label: "Marketplace", icon: "shop" },
  ];

  const vendorLinks = [
    {
      href: "/vendor/dashboard",
      label: "Vendor Dashboard",
      icon: "dashboard",
      badge: "Vendor",
    },
    { href: "/vendor/listings", label: "My Listings", icon: "shop" },
    { href: "/vendor/sales", label: "Sales & Orders", icon: "money" },
    { href: "/vendor/boarding", label: "Boarding Places", icon: "home" },
    { href: "/vendor/shop", label: "Shop Settings", icon: "settings" },
  ];

  const tutorLinks = [
    { href: "/tutor/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/tutor/courses", label: "My Courses", icon: "courses" },
    { href: "/tutor/create-course", label: "Create Course", icon: "add" },
    { href: "/tutor/live-sessions", label: "Live Sessions", icon: "video" },
    { href: "/tutor/students", label: "Students", icon: "users" },
    { href: "/tutor/earnings", label: "Earnings", icon: "money" },
    { href: "/tutor/analytics", label: "Analytics", icon: "chart" },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/admin/users", label: "Users", icon: "users" },
    { href: "/admin/courses", label: "Courses", icon: "courses" },
    { href: "/admin/reports", label: "Reports", icon: "chart" },
    { href: "/admin/settings", label: "Settings", icon: "settings" },
  ];

  const links =
    userType === "tutor"
      ? tutorLinks
      : userType === "admin"
        ? adminLinks
        : studentLinks;

  // Show vendor links if user has completed vendor profile
  const showVendorSection =
    userType === "student" && user?.isVendorProfileComplete;
  const hasVendorOption =
    userType === "student" && !user?.isVendorProfileComplete;

  const bottomLinks = [
    { href: "/settings", label: "Settings", icon: "settings" },
    { href: "/help", label: "Help Center", icon: "help" },
  ];

  const IconComponent = ({ name }: { name: string }) => {
    const icons: Record<string, React.ReactElement> = {
      dashboard: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      courses: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
      book: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      chart: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      shop: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      certificate: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      message: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
      add: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      users: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      money: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      settings: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      help: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      video: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      home: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    };
    return icons[name] || icons.dashboard;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay animate-fade-in" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside
        className={`flex flex-col h-full`}
        style={{
          width: "100%",
          background: "var(--ink)",
          color: "#fff",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Collapse toggle - Desktop */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
          {isOpen && (
            <span style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#a9f0df" }}>
              Navigation
            </span>
          )}
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors ml-auto"
            aria-label="Toggle sidebar"
          >
            <svg
              className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isOpen ? "rotate-0" : "rotate-180"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 min-h-0 py-6 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-item group relative ${
                    isActive ? "sidebar-item-active" : ""
                  }`}
                >
                  <span className="sidebar-item-icon">
                    <IconComponent name={link.icon} />
                  </span>
                  {isOpen ? (
                    <span className="text-sm font-medium truncate">
                      {link.label}
                    </span>
                  ) : (
                    <span className="tooltip">{link.label}</span>
                  )}
                  {isActive && (
                    <span className="absolute right-3 w-2 h-2 rounded-full bg-ocean-400" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Vendor Section - Only show if user has completed vendor profile */}
          {showVendorSection && (
            <>
              <div className="my-6 mx-4 divider-gradient" />

              {isOpen && (
                <div className="px-4 mb-3">
                  <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    Vendor Tools
                  </span>
                </div>
              )}

              <div className="space-y-1">
                {vendorLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`sidebar-item group relative ${
                        isActive
                          ? "sidebar-item-active bg-amber-500/10 hover:bg-amber-500/20"
                          : "hover:bg-amber-500/5"
                      }`}
                    >
                      <span className="sidebar-item-icon text-amber-400">
                        <IconComponent name={link.icon} />
                      </span>
                      {isOpen ? (
                        <span className="text-sm font-medium truncate">
                          {link.label}
                        </span>
                      ) : (
                        <span className="tooltip">{link.label}</span>
                      )}
                      {isActive && (
                        <span className="absolute right-3 w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {/* Become Vendor CTA - Only show if user is not a vendor yet */}
          {hasVendorOption && (
            <>
              <div className="my-6 mx-4 divider-gradient" />

              <Link
                href="/student/become-vendor"
                className="mx-2 p-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all text-white"
              >
                {isOpen ? (
                  <div className="flex items-center gap-3">
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <div>
                      <div className="text-sm font-semibold">
                        Become a Vendor
                      </div>
                      <div className="text-xs opacity-90">
                        Start selling on marketplace
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center">
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
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                )}
              </Link>
            </>
          )}

          {/* Divider */}
          <div className="my-6 mx-4 divider-gradient" />

          {/* Bottom Links */}
          <div className="space-y-1">
            {bottomLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`sidebar-item group relative ${
                    isActive ? "sidebar-item-active" : ""
                  }`}
                >
                  <span className="sidebar-item-icon">
                    <IconComponent name={link.icon} />
                  </span>
                  {isOpen ? (
                    <span className="text-sm font-medium truncate">
                      {link.label}
                    </span>
                  ) : (
                    <span className="tooltip">{link.label}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-white/10 p-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--brand)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
              }}
            >
              {user?.firstName?.[0] || ""}{user?.lastName?.[0] || ""}
            </div>
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 truncate capitalize">
                  {user?.primaryRole || userType}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
