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

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/courses", label: "Browse Courses", icon: "📚" },
  { href: "/student/my-courses", label: "My Courses", icon: "📋" },
  { href: "/student/live-sessions", label: "Live Sessions", icon: "🎥" },
  { href: "/boarding", label: "Boarding", icon: "🏡" },
  { href: "/marketplace", label: "Marketplace", icon: "🛍️" },
];

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Vendor Dashboard", icon: "🏪" },
  { href: "/vendor/listings", label: "My Listings", icon: "🔒" },
  { href: "/vendor/sales", label: "Sales & Orders", icon: "💰" },
  { href: "/vendor/boarding", label: "Boarding Places", icon: "🏠" },
  { href: "/vendor/shop", label: "Shop Settings", icon: "⚙️" },
];

const tutorLinks = [
  { href: "/tutor/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/tutor/courses", label: "My Courses", icon: "📚" },
  { href: "/tutor/create-course", label: "Create Course", icon: "➕" },
  { href: "/tutor/live-sessions", label: "Live Sessions", icon: "🎥" },
  { href: "/tutor/students", label: "Students", icon: "👥" },
  { href: "/tutor/earnings", label: "Earnings", icon: "💰" },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/courses", label: "Courses", icon: "📚" },
  { href: "/admin/reports", label: "Reports", icon: "📊" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const bottomLinks = [
  { href: "/settings", label: "Settings", icon: "⚙️" },
  { href: "/help", label: "Help Center", icon: "❓" },
];

export default function Sidebar({ isOpen, onToggle, userType = "student" }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const links =
    userType === "tutor" ? tutorLinks
    : userType === "admin" ? adminLinks
    : studentLinks;

  const showVendorSection = user?.isVendorProfileComplete;
  const showBecomeVendor = !user?.isVendorProfileComplete && userType === "student";

  const NavItem = ({ href, label, icon, accent }: { href: string; label: string; icon: string; accent?: boolean }) => {
    const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        title={!isOpen ? label : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: isOpen ? 12 : 0,
          padding: isOpen ? "10px 16px" : "10px 0",
          margin: "2px 8px",
          borderRadius: 6,
          textDecoration: "none",
          fontSize: 14,
          fontWeight: isActive ? 800 : 500,
          color: isActive ? "#fff" : "#b0b8c1",
          background: isActive
            ? accent ? "rgba(245,158,11,.18)" : "rgba(11,107,95,.35)"
            : "transparent",
          borderLeft: isActive ? `3px solid ${accent ? "#f59e0b" : "var(--brand)"}` : "3px solid transparent",
          transition: "all .15s",
          overflow: "hidden",
          whiteSpace: "nowrap",
          justifyContent: isOpen ? "flex-start" : "center",
        }}
        onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.07)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
        onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#b0b8c1"; } }}
      >
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
        {isOpen && <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
      </Link>
    );
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "var(--ink)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Toggle button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isOpen ? "space-between" : "center",
          padding: isOpen ? "12px 16px" : "12px 0",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}
      >
        {isOpen && (
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--brand)" }}>
            Navigation
          </span>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex"
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            background: "rgba(255,255,255,.08)",
            border: "none",
            borderRadius: 4,
            color: "#b0b8c1",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
          }}
          aria-label="Toggle sidebar"
        >
          {isOpen ? "‹‹" : "››"}
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 0" }}>
        <div>
          {links.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </div>

        {/* Vendor Tools */}
        {showVendorSection && (
          <>
            <div style={{ margin: "12px 16px", height: 1, background: "rgba(255,255,255,.08)" }} />
            {isOpen && (
              <div style={{ padding: "4px 16px 8px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f59e0b" }}>
                Vendor Tools
              </div>
            )}
            {vendorLinks.map((link) => (
              <NavItem key={link.href} {...link} accent />
            ))}
          </>
        )}

        {/* Become Vendor CTA */}
        {showBecomeVendor && isOpen && (
          <>
            <div style={{ margin: "12px 16px", height: 1, background: "rgba(255,255,255,.08)" }} />
            <Link
              href="/student/become-vendor"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                margin: "4px 8px",
                padding: "10px 12px",
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                borderRadius: 6,
                textDecoration: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <span style={{ fontSize: 16 }}>🛍️</span>
              <div>
                <div>Become a Vendor</div>
                <div style={{ fontSize: 11, fontWeight: 400, opacity: .85 }}>Start selling</div>
              </div>
            </Link>
          </>
        )}

        <div style={{ margin: "12px 16px", height: 1, background: "rgba(255,255,255,.08)" }} />

        {/* Bottom links */}
        {bottomLinks.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </nav>

      {/* User profile */}
      <div style={{ padding: isOpen ? "12px 16px" : "12px 0", borderTop: "1px solid rgba(255,255,255,.08)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10, justifyContent: isOpen ? "flex-start" : "center" }}>
        <div
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "var(--brand)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 12, flexShrink: 0,
          }}
        >
          {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
        </div>
        {isOpen && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>
              {user?.primaryRole || userType}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
