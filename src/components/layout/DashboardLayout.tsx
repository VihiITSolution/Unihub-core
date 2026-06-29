"use client";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div style={{ padding: "28px", minHeight: "calc(100vh - 72px)" }}>
      {children}
    </div>
  );
}
