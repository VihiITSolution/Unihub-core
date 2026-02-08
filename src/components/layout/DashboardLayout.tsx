"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType?: "student" | "tutor" | "admin";
}

export default function DashboardLayout({
  children,
  userType = "student",
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Hide the parent layout's header/footer by positioning over them */}
      <style jsx global>{`
        body > div > header,
        body > div > footer {
          display: none !important;
        }
        body > div > main {
          flex: none !important;
        }
      `}</style>

      <div className="fixed inset-0 bg-gray-50 flex">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          userType={userType}
        />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
            !isMobile && sidebarOpen ? "lg:ml-64" : !isMobile ? "lg:ml-20" : ""
          }`}
        >
          {/* Dashboard Header */}
          <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              {/* Logo for mobile */}
              <Link href="/" className="lg:hidden flex items-center gap-2">
                <Image
                  src="/Unihub.webp"
                  alt="UniHub"
                  width={32}
                  height={32}
                  className="object-contain"
                />
                <span className="font-bold text-navy-900">UniHub</span>
              </Link>

              {/* Breadcrumb or Page Title */}
              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {userType === "tutor"
                    ? "Tutor Dashboard"
                    : userType === "admin"
                      ? "Admin Dashboard"
                      : "My Learning"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-ocean-400 focus:border-transparent bg-gray-50 focus:bg-white transition-all text-sm"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-ocean-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ocean-400 to-ocean-600 flex items-center justify-center text-white text-sm font-medium">
                  {user?.firstName?.[0] || ""}
                  {user?.lastName?.[0] || ""}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {user?.firstName || ""} {user?.lastName || ""}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </>
  );
}
