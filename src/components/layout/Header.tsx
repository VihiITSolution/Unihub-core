"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RoleUpgradeModal, NotificationBell } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [requiredRole, setRequiredRole] = useState<RoleType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isAuthenticated, switchRole } = useAuth();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const getDashboardLink = () => {
    if (!isAuthenticated || !user) {
      return { href: "/student/dashboard", label: "My Learning", requiresRole: null };
    }
    if (user.primaryRole === "tutor") {
      return { href: "/tutor/dashboard", label: "My Teaching", requiresRole: null };
    }
    return { href: "/student/dashboard", label: "My Learning", requiresRole: null };
  };

  const navLinks = [
    { href: "/courses", label: "Courses", requiresRole: null },
    ...(user?.roles?.includes("tutor")
      ? []
      : [{ href: "/tutor/dashboard", label: "Teach", requiresRole: "tutor" as RoleType }]),
    { href: "/marketplace", label: "Marketplace", requiresRole: null },
    { href: "/boarding", label: "Boarding", requiresRole: null },
    getDashboardLink(),
  ];

  const handleNavClick = (e: React.MouseEvent, link: (typeof navLinks)[0]) => {
    if (!isAuthenticated) return;
    if (link.requiresRole) {
      const userRoles = user?.roles || [];
      if (!userRoles.includes(link.requiresRole) || link.requiresRole === "tutor") {
        e.preventDefault();
        setRequiredRole(link.requiresRole);
        setRoleModalOpen(true);
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--white)",
        borderBottom: "1px solid var(--line)",
        boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,.08)" : "0 2px 4px rgba(0,0,0,.04)",
        transition: "box-shadow .2s",
      }}
      suppressHydrationWarning
    >
      {/* Main topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          minHeight: 72,
          padding: "0 28px",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        {/* Mobile menu button */}
        <button
          className="lg:hidden"
          style={{
            width: 40,
            minHeight: 40,
            border: "1px solid var(--line)",
            background: "transparent",
            fontSize: 18,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 146,
            fontWeight: 800,
            textDecoration: "none",
            color: "var(--ink)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              borderRadius: 7,
              background: "var(--brand)",
              color: "var(--white)",
              fontSize: 20,
              fontWeight: 800,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            U
          </span>
          <span style={{ lineHeight: 1 }}>
            UniHub
            <small
              style={{
                display: "block",
                marginTop: 2,
                color: "var(--muted)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              LEARN. EARN. GROW.
            </small>
          </span>
        </Link>

        {/* Search bar — desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex"
          style={{ flex: 1, minWidth: 280, maxWidth: 520 }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              height: 46,
              padding: "0 16px",
              border: "1px solid var(--ink)",
              borderRadius: 999,
              background: "var(--soft)",
            }}
          >
            <span style={{ color: "var(--muted)", fontSize: 14, flexShrink: 0 }}>Find</span>
            <input
              type="search"
              placeholder="Code, module, kuppi, lecturer, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 0,
                outline: 0,
                background: "transparent",
                color: "var(--ink)",
                fontSize: 14,
              }}
            />
          </div>
        </form>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center" style={{ gap: 2, flexShrink: 0 }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              style={{
                padding: "0 10px",
                fontSize: 14,
                fontWeight: 600,
                color: "var(--ink)",
                whiteSpace: "nowrap",
                minHeight: 40,
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 4,
                transition: "color .15s",
              }}
              className="hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions — desktop */}
        <div className="hidden lg:flex items-center" style={{ gap: 8, flexShrink: 0 }}>
          {isAuthenticated && <NotificationBell />}

          {/* Cart */}
          <Link
            href="/marketplace"
            style={{
              width: 42,
              minHeight: 40,
              border: "1px solid var(--ink)",
              background: "var(--white)",
              fontSize: 18,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              transition: "background .15s",
            }}
            className="hover:bg-soft"
            aria-label="Marketplace"
          >
            🛒
          </Link>

          {/* Auth area */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 40,
                  padding: "0 12px",
                  border: "1px solid var(--line)",
                  background: "var(--white)",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--ink)",
                  transition: "background .15s",
                  borderRadius: 4,
                }}
                className="hover:bg-soft"
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--brand)",
                    color: "var(--white)",
                    fontSize: 12,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span className="hidden md:block">{user.firstName}</span>
                <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 8px)",
                    width: 280,
                    background: "var(--white)",
                    border: "1px solid var(--line)",
                    boxShadow: "var(--shadow)",
                    zIndex: 50,
                    padding: "8px 0",
                  }}
                >
                  {/* Current mode */}
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--line)" }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Current Mode
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: user.primaryRole === "student" ? "#3b82f6" : user.primaryRole === "tutor" ? "var(--brand)" : "#8b5cf6",
                        }}
                      />
                      <span style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{user.primaryRole}</span>
                    </div>
                  </div>

                  {/* Role switcher */}
                  {user.roles && user.roles.length > 1 && (
                    <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--line)" }}>
                      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Switch Mode
                      </p>
                      <div style={{ display: "grid", gap: 4 }}>
                        {user.roles.includes("student") && (
                          <button
                            onClick={async () => {
                              if (user.primaryRole !== "student") {
                                const result = await switchRole("student");
                                if (result.success) { router.push("/student/dashboard"); setIsProfileOpen(false); }
                              }
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              border: "none",
                              background: user.primaryRole === "student" ? "#eff6ff" : "transparent",
                              color: user.primaryRole === "student" ? "#1d4ed8" : "var(--ink)",
                              fontSize: 14,
                              fontWeight: user.primaryRole === "student" ? 700 : 400,
                              cursor: "pointer",
                              borderRadius: 4,
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6" }} />
                              Student
                            </span>
                            {user.primaryRole === "student" && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )}
                        {user.roles.includes("tutor") && (
                          <button
                            onClick={async () => {
                              if (user.primaryRole !== "tutor") {
                                const result = await switchRole("tutor");
                                if (result.success) { router.push("/tutor/dashboard"); setIsProfileOpen(false); }
                              }
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 10px",
                              border: "none",
                              background: user.primaryRole === "tutor" ? "#f0fdf4" : "transparent",
                              color: user.primaryRole === "tutor" ? "#15803d" : "var(--ink)",
                              fontSize: 14,
                              fontWeight: user.primaryRole === "tutor" ? 700 : 400,
                              cursor: "pointer",
                              borderRadius: 4,
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--brand)" }} />
                              Tutor
                            </span>
                            {user.primaryRole === "tutor" && (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ display: "block", padding: "10px 16px", fontSize: 14, color: "var(--ink)" }}
                    className="hover:bg-soft"
                  >
                    Settings
                  </Link>
                  <div style={{ borderTop: "1px solid var(--line)", margin: "4px 0" }} />
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); router.push("/"); }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      border: "none",
                      background: "transparent",
                      fontSize: 14,
                      color: "#dc2626",
                      cursor: "pointer",
                    }}
                    className="hover:bg-red-50"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                style={{
                  minHeight: 40,
                  display: "inline-grid",
                  placeItems: "center",
                  padding: "0 14px",
                  border: "1px solid var(--ink)",
                  background: "var(--white)",
                  color: "var(--ink)",
                  fontSize: 14,
                  fontWeight: 800,
                  transition: "background .15s",
                }}
                className="hover:bg-soft"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                style={{
                  minHeight: 40,
                  display: "inline-grid",
                  placeItems: "center",
                  padding: "0 14px",
                  border: "1px solid var(--ink)",
                  background: "var(--ink)",
                  color: "var(--white)",
                  fontSize: 14,
                  fontWeight: 800,
                  transition: "background .15s",
                }}
                className="hover:bg-gray-900"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="flex lg:hidden items-center ml-auto" style={{ gap: 8 }}>
          {isAuthenticated && <NotificationBell />}
          <Link
            href="/marketplace"
            style={{
              width: 40,
              minHeight: 40,
              border: "1px solid var(--line)",
              background: "var(--white)",
              fontSize: 18,
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Marketplace"
          >
            🛒
          </Link>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div
          style={{
            background: "var(--white)",
            borderTop: "1px solid var(--line)",
          }}
          className="lg:hidden"
        >
          {/* Mobile search */}
          <form onSubmit={handleSearch} style={{ padding: "12px 16px", borderBottom: "1px solid var(--line)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                height: 46,
                padding: "0 16px",
                border: "1px solid var(--ink)",
                borderRadius: 999,
                background: "var(--soft)",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: 14 }}>Find</span>
              <input
                type="search"
                placeholder="Search kuppi sessions, modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 14, color: "var(--ink)" }}
              />
            </div>
          </form>

          {/* Nav links */}
          <div style={{ padding: "8px 0" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ display: "block", padding: "12px 20px", fontSize: 14, fontWeight: 600, color: "var(--ink)" }}
                className="hover:bg-soft"
                onClick={(e) => { handleNavClick(e, link); setIsMenuOpen(false); }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile auth */}
          {!isAuthenticated ? (
            <div style={{ borderTop: "1px solid var(--line)", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 42, border: "1px solid var(--ink)", color: "var(--ink)",
                  fontSize: 14, fontWeight: 800,
                }}
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 42, background: "var(--ink)", color: "var(--white)",
                  fontSize: 14, fontWeight: 800,
                }}
              >
                Sign up
              </Link>
            </div>
          ) : user && (
            <div style={{ borderTop: "1px solid var(--line)", padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: "50%",
                    background: "var(--brand)", color: "var(--white)",
                    fontSize: 14, fontWeight: 800,
                    display: "grid", placeItems: "center",
                  }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{user.firstName} {user.lastName}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>{user.primaryRole}</div>
                </div>
              </div>
              <button
                onClick={() => { logout(); router.push("/"); setIsMenuOpen(false); }}
                style={{ fontSize: 14, color: "#dc2626", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      )}

      {requiredRole && (
        <RoleUpgradeModal
          isOpen={roleModalOpen}
          onClose={() => setRoleModalOpen(false)}
          roleType={requiredRole}
          featureName={navLinks.find((l) => l.requiresRole === requiredRole)?.label}
        />
      )}
    </header>
  );
}
