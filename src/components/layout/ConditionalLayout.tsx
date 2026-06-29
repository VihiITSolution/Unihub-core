"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Footer from "./Footer";
import Sidebar from "./Sidebar";

const DASHBOARD_PREFIXES = ["/student", "/tutor", "/vendor", "/admin"];

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const sidebarWidth = !isMobile ? (sidebarOpen ? 256 : 80) : 0;

  // Still checking auth — render public layout to avoid flash
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Not authenticated — simple public layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Authenticated — sidebar visible on ALL pages
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f8fa" }}>
      {/* Same header everywhere */}
      <Header />

      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, top: 104,
              background: "rgba(0,0,0,.5)", zIndex: 39,
            }}
          />
        )}

        {/* Fixed sidebar */}
        <div
          style={{
            position: "fixed",
            top: 104,
            bottom: 0,
            left: 0,
            width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarWidth,
            zIndex: 40,
            transition: "width .25s ease",
            overflow: "hidden",
          }}
        >
          <Sidebar
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            userType={user?.primaryRole as "student" | "tutor" | "admin" | undefined}
          />
        </div>

        {/* Page content — offset by sidebar */}
        <div
          style={{
            flex: 1,
            marginLeft: isMobile ? 0 : sidebarWidth,
            transition: "margin-left .25s ease",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden" style={{ padding: "12px 16px", background: "#fff", borderBottom: "1px solid var(--line)" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 14, fontWeight: 800, color: "var(--ink)",
                background: "none", border: "none", cursor: "pointer",
              }}
            >
              ☰ Menu
            </button>
          </div>

          <main style={{ flex: 1 }}>{children}</main>

          {/* Footer only on non-dashboard public pages */}
          {!isDashboard && <Footer />}
        </div>
      </div>
    </div>
  );
}
