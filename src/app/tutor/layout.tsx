"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["tutor"]}>
      <DashboardLayout userType="tutor">{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

