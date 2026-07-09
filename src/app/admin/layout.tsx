"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin/faculties", label: "Faculties & Departments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <DashboardLayout>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Admin sub-nav */}
          <aside style={{
            width: 200, flexShrink: 0,
            background: "#fff", border: "1px solid var(--line)", borderRadius: 8,
            padding: "8px 0",
            position: "sticky", top: 120,
          }}>
            <div style={{ padding: "10px 16px 8px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Admin
            </div>
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  style={{
                    display: "block", padding: "9px 16px",
                    fontSize: 13, fontWeight: active ? 800 : 500,
                    color: active ? "var(--brand-dark)" : "var(--ink)",
                    textDecoration: "none",
                    background: active ? "#f0fdf9" : "transparent",
                    borderLeft: active ? "3px solid var(--brand)" : "3px solid transparent",
                    transition: "all .12s",
                  }}
                >
                  {n.label}
                </Link>
              );
            })}
          </aside>

          {/* Page content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {children}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
