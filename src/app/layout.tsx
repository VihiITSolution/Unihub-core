import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

export const metadata: Metadata = {
  title: "UniHub - E-Learning & Marketplace",
  description: "Your platform for online learning and marketplace solutions",
  icons: {
    icon: "/Unihub.webp",
    shortcut: "/Unihub.webp",
    apple: "/Unihub.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <AuthProvider>
          <SidebarProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
