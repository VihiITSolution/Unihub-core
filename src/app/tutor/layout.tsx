import DashboardLayout from "@/components/layout/DashboardLayout";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout userType="tutor">{children}</DashboardLayout>;
}
