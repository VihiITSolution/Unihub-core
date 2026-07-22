"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
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
  const { isOpen: sidebarOpen, isMobile, toggle } = useSidebar();

  const isDashboard = DASHBOARD_PREFIXES.some((p) => pathname?.startsWith(p));
  const sidebarWidth = !isMobile ? (sidebarOpen ? 256 : 80) : 0;

  // Loading or not authenticated — simple public layout
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        {!isLoading && <Footer />}
      </div>
    );
  }

  // Authenticated — sidebar visible on ALL pages
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f7f8fa" }}>
      <Header />

      <div style={{ display: "flex", flex: 1, position: "relative" }}>
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            onClick={toggle}
            style={{
              position: "fixed", inset: 0, top: isMobile ? 64 : 104,
              background: "rgba(0,0,0,.5)", zIndex: 39,
            }}
          />
        )}

        {/* Fixed sidebar — starts below header (64px topbar + 40px faculty nav on desktop) */}
        <div
          style={{
            position: "fixed",
            top: isMobile ? 64 : 104,
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
            onToggle={toggle}
            userType={user?.primaryRole as "student" | "tutor" | "admin" | undefined}
          />
        </div>

        {/* Page content */}
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
          <main style={{ flex: 1 }}>{children}</main>
          {!isDashboard && <Footer />}
        </div>
      </div>
    </div>
  );
}
