"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { RoleUpgradeModal, NotificationBell } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [requiredRole, setRequiredRole] = useState<RoleType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout, isAuthenticated, switchRole } = useAuth();
  const { toggle: toggleSidebar, isOpen: sidebarOpen } = useSidebar();
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
    if (user?.primaryRole === "tutor") return { href: "/tutor/dashboard", label: "My Teaching" };
    return { href: "/student/dashboard", label: "My Learning" };
  };

  const navLinks = [
    { ...getDashboardLink(), requiresRole: null },
    ...(user?.roles?.includes("tutor")
      ? []
      : [{ href: "/tutor/dashboard", label: "Tutor", requiresRole: "tutor" as RoleType }]),
    { href: "/marketplace", label: "Marketplace", requiresRole: null },
    { href: "/boarding", label: "Boarding", requiresRole: null },
  ];

  const handleNavClick = (e: React.MouseEvent, link: (typeof navLinks)[0]) => {
    if (!isAuthenticated) return;
    if (link.requiresRole) {
      const userRoles = user?.roles || [];
      if (!userRoles.includes(link.requiresRole)) {
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
        boxShadow: isScrolled ? "0 2px 8px rgba(0,0,0,.08)" : "0 1px 3px rgba(0,0,0,.04)",
        transition: "box-shadow .2s",
      }}
      suppressHydrationWarning
    >
      {/* ── Row 1: topbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          height: 64,
          padding: "0 24px",
          width: "100%",
        }}
      >
        {/* Sidebar / menu toggle — works on all screen sizes */}
        <button
          style={{
            width: 36, height: 36, flexShrink: 0,
            border: "1px solid var(--line)",
            background: "transparent",
            fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: 4, transition: "background .15s",
          }}
          onClick={() => {
            if (isAuthenticated) {
              toggleSidebar();
            } else {
              setIsMenuOpen(!isMenuOpen);
            }
          }}
          aria-label="Toggle sidebar"
        >
          {(!isAuthenticated && isMenuOpen) ? "✕" : "☰"}
        </button>

        {/* Brand */}
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            fontWeight: 800, textDecoration: "none", color: "var(--ink)", flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 34, height: 34, borderRadius: 6,
              background: "var(--brand)", color: "#fff",
              fontSize: 18, fontWeight: 800,
              display: "grid", placeItems: "center", flexShrink: 0,
            }}
          >
            U
          </span>
          <span style={{ lineHeight: 1.1, fontSize: 15 }}>
            UniHub
            <small style={{ display: "block", color: "var(--muted)", fontSize: 9, fontWeight: 700, letterSpacing: "0.09em" }}>
              LEARN. EARN. GROW.
            </small>
          </span>
        </Link>

        {/* Search bar — desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden lg:flex"
          style={{ flex: 1, minWidth: 0 }}
        >
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", height: 42,
              padding: "0 16px",
              border: "1.5px solid var(--ink)",
              borderRadius: 999,
              background: "var(--soft)",
            }}
          >
            <span style={{ color: "var(--muted)", fontSize: 13, flexShrink: 0 }}>Find</span>
            <input
              type="search"
              placeholder="Code, module, lecturer, topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1, border: 0, outline: 0,
                background: "transparent", color: "var(--ink)", fontSize: 14,
                minWidth: 0,
              }}
            />
          </div>
        </form>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center flex-shrink-0" style={{ gap: 0 }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link)}
              style={{
                padding: "0 10px", fontSize: 14, fontWeight: 600,
                color: "var(--ink)", whiteSpace: "nowrap",
                height: 40, display: "inline-flex", alignItems: "center",
                borderRadius: 4, transition: "color .15s", textDecoration: "none",
              }}
              className="hover:text-brand"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center flex-shrink-0" style={{ gap: 6 }}>
          {isAuthenticated && <NotificationBell />}

          {/* Cart */}
          <Link
            href="/marketplace"
            style={{
              width: 38, height: 38,
              border: "1px solid var(--line)",
              background: "var(--white)",
              display: "grid", placeItems: "center",
              cursor: "pointer", borderRadius: 4,
              transition: "background .15s", fontSize: 16,
              textDecoration: "none",
            }}
            className="hover:bg-soft"
            aria-label="Marketplace"
          >
            🛒
          </Link>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  height: 38, padding: "0 10px",
                  border: "1px solid var(--line)",
                  background: "var(--white)",
                  cursor: "pointer", fontWeight: 700, fontSize: 14,
                  color: "var(--ink)", borderRadius: 4,
                  transition: "background .15s",
                }}
                className="hover:bg-soft"
              >
                <div
                  style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: "var(--brand)", color: "#fff",
                    fontSize: 11, fontWeight: 800,
                    display: "grid", placeItems: "center", flexShrink: 0,
                  }}
                >
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </div>
                <span className="hidden md:block" style={{ maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.firstName}
                </span>
                <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: .5 }}>
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Profile dropdown */}
              {isProfileOpen && (
                <div
                  style={{
                    position: "absolute", right: 0, top: "calc(100% + 6px)",
                    width: 268, background: "var(--white)",
                    border: "1px solid var(--line)", boxShadow: "var(--shadow)",
                    zIndex: 50, padding: "8px 0", borderRadius: 6,
                  }}
                >
                  <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
                    <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Current Mode
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: user.primaryRole === "student" ? "#3b82f6" : user.primaryRole === "tutor" ? "var(--brand)" : "#8b5cf6" }} />
                      <span style={{ fontSize: 14, fontWeight: 600, textTransform: "capitalize" }}>{user.primaryRole}</span>
                    </div>
                  </div>

                  {user.roles && user.roles.length > 1 && (
                    <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--line)" }}>
                      <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Switch Mode
                      </p>
                      {(["student", "tutor"] as const).map((role) =>
                        user.roles?.includes(role) ? (
                          <button
                            key={role}
                            onClick={async () => {
                              if (user.primaryRole !== role) {
                                const result = await switchRole(role);
                                if (result.success) { router.push(`/${role}/dashboard`); setIsProfileOpen(false); }
                              }
                            }}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "7px 8px", border: "none", width: "100%", textAlign: "left",
                              background: user.primaryRole === role ? (role === "student" ? "#eff6ff" : "#f0fdf4") : "transparent",
                              color: user.primaryRole === role ? (role === "student" ? "#1d4ed8" : "#15803d") : "var(--ink)",
                              fontSize: 14, fontWeight: user.primaryRole === role ? 700 : 400,
                              cursor: "pointer", borderRadius: 4,
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: role === "student" ? "#3b82f6" : "var(--brand)" }} />
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                            {user.primaryRole === role && (
                              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ) : null
                      )}
                    </div>
                  )}

                  <Link
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    style={{ display: "block", padding: "9px 14px", fontSize: 14, color: "var(--ink)", textDecoration: "none" }}
                    className="hover:bg-soft"
                  >
                    Settings
                  </Link>
                  <div style={{ borderTop: "1px solid var(--line)", margin: "4px 0" }} />
                  <button
                    onClick={() => { setIsProfileOpen(false); logout(); router.push("/"); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "9px 14px", border: "none", background: "transparent",
                      fontSize: 14, color: "#dc2626", cursor: "pointer",
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
                  height: 38, display: "inline-flex", alignItems: "center",
                  padding: "0 14px",
                  border: "1.5px solid var(--line)",
                  background: "var(--white)",
                  color: "var(--ink)", fontSize: 14, fontWeight: 700,
                  transition: "border-color .15s", textDecoration: "none",
                  borderRadius: 4,
                }}
                className="hover:border-ink"
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                style={{
                  height: 38, display: "inline-flex", alignItems: "center",
                  padding: "0 16px",
                  border: "1.5px solid var(--ink)",
                  background: "var(--ink)",
                  color: "#fff", fontSize: 14, fontWeight: 700,
                  transition: "background .15s", textDecoration: "none",
                  borderRadius: 4,
                }}
                className="hover:bg-gray-900"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="flex lg:hidden items-center ml-auto" style={{ gap: 6 }}>
          {isAuthenticated && <NotificationBell />}
          <Link
            href="/marketplace"
            style={{
              width: 36, height: 36,
              border: "1px solid var(--line)",
              background: "var(--white)", fontSize: 16,
              display: "grid", placeItems: "center",
              textDecoration: "none", borderRadius: 4,
            }}
            aria-label="Marketplace"
          >
            🛒
          </Link>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {isMenuOpen && (
        <div style={{ background: "var(--white)", borderTop: "1px solid var(--line)" }} className="lg:hidden">
          {/* Mobile search */}
          <form onSubmit={handleSearch} style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>
            <div
              style={{
                display: "flex", alignItems: "center", gap: 8,
                height: 42, padding: "0 14px",
                border: "1.5px solid var(--ink)", borderRadius: 999, background: "var(--soft)",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: 13 }}>Find</span>
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
          <div style={{ padding: "6px 0" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{ display: "block", padding: "11px 18px", fontSize: 14, fontWeight: 600, color: "var(--ink)", textDecoration: "none" }}
                className="hover:bg-soft"
                onClick={(e) => { handleNavClick(e, link); setIsMenuOpen(false); }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile auth */}
          {!isAuthenticated ? (
            <div style={{ borderTop: "1px solid var(--line)", padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 42, border: "1.5px solid var(--line)", color: "var(--ink)",
                  fontSize: 14, fontWeight: 700, textDecoration: "none", borderRadius: 4,
                }}
              >
                Log in
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  height: 42, background: "var(--ink)", color: "#fff",
                  fontSize: 14, fontWeight: 700, textDecoration: "none", borderRadius: 4,
                }}
              >
                Sign up
              </Link>
            </div>
          ) : user && (
            <div style={{ borderTop: "1px solid var(--line)", padding: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--brand)", color: "#fff",
                    fontSize: 13, fontWeight: 800,
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
