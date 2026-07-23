"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/settings/profile",       label: "Edit Profile" },
  { href: "/settings/security",      label: "Security" },
  { href: "/settings/notifications", label: "Notifications" },
  { href: "/settings/privacy",       label: "Privacy" },
  { href: "/settings/accounts",      label: "Linked Accounts" },
  { href: "/settings/danger",        label: "Delete Account", danger: true },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-52 flex-shrink-0">
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {NAV.map(({ href, label, danger }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={[
                      "block px-4 py-3 text-sm font-medium border-b border-gray-50 last:border-0 transition-colors",
                      active
                        ? danger
                          ? "bg-red-50 text-red-700 border-l-2 border-l-red-500"
                          : "bg-blue-50 text-blue-700 border-l-2 border-l-blue-600"
                        : danger
                          ? "text-red-600 hover:bg-red-50"
                          : "text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Page content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
