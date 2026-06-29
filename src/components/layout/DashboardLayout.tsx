"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

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

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f8fa" }}>
      {/* Same header as every other page */}
      <Header />

      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 39 }}
          />
        )}

        {/* Sidebar */}
        <div
          style={{
            position: "fixed",
            top: 72,
            bottom: 0,
            left: 0,
            width: isMobile ? (sidebarOpen ? 256 : 0) : (sidebarOpen ? 256 : 80),
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

        {/* Page content */}
        <main
          style={{
            flex: 1,
            marginLeft: isMobile ? 0 : sidebarWidth,
            transition: "margin-left .25s ease",
            minWidth: 0,
            padding: "28px 28px",
            overflowX: "hidden",
          }}
        >
          {/* Mobile sidebar toggle */}
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
              fontSize: 14, fontWeight: 800, color: "var(--ink)",
              background: "none", border: "none", cursor: "pointer",
            }}
          >
            ☰ Menu
          </button>

          {children}
        </main>
      </div>
    </div>
  );
}
