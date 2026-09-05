"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar } from "@/components/ui";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  userType?: "student" | "tutor" | "admin";
}

// ── SVG icon components ──────────────────────────────────────────────────────
const Icon = ({ d, d2 }: { d: string; d2?: string }) => (
  <svg
    width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

const Icons = {
  home:       <Icon d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />,
  bookOpen:   <Icon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />,
  clipboard:  <Icon d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
  video:      <Icon d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />,
  building:   <Icon d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />,
  shoppingBag:<Icon d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  store:      <Icon d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />,
  listBullet: <Icon d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  currency:   <Icon d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />,
  cog:        <Icon d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
  questionCircle: <Icon d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />,
  plusCircle:  <Icon d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
  users:       <Icon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  chartBar:    <Icon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
  tag:         <Icon d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L9.568 3z M6 6h.008v.008H6V6z" />,
};

// ── Nav link definitions ─────────────────────────────────────────────────────
const studentLinks = [
  { href: "/student/dashboard",    label: "Dashboard",      icon: Icons.home },
  { href: "/wall",                 label: "Wall",           icon: Icons.users },
  { href: "/courses",              label: "Browse Courses", icon: Icons.bookOpen },
  { href: "/student/my-courses",   label: "My Courses",     icon: Icons.clipboard },
  { href: "/student/live-sessions",label: "Live Sessions",  icon: Icons.video },
  { href: "/student/affiliate",    label: "Affiliate",      icon: Icons.currency },
  { href: "/boarding",             label: "Boarding",       icon: Icons.building },
  { href: "/marketplace",          label: "Marketplace",    icon: Icons.shoppingBag },
];

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Vendor Dashboard", icon: Icons.store },
  { href: "/vendor/listings",  label: "My Listings",      icon: Icons.listBullet },
  { href: "/vendor/sales",     label: "Sales & Orders",   icon: Icons.currency },
  { href: "/vendor/boarding",  label: "Boarding Places",  icon: Icons.building },
  { href: "/vendor/shop",      label: "Shop Settings",    icon: Icons.cog },
];

const tutorLinks = [
  { href: "/tutor/dashboard",      label: "Dashboard",     icon: Icons.home },
  { href: "/wall",                 label: "Wall",          icon: Icons.users },
  { href: "/tutor/courses",        label: "My Courses",    icon: Icons.bookOpen },
  { href: "/tutor/create-course",  label: "Create Course", icon: Icons.plusCircle },
  { href: "/tutor/live-sessions",  label: "Live Sessions", icon: Icons.video },
  { href: "/tutor/students",       label: "Students",      icon: Icons.users },
  { href: "/tutor/earnings",       label: "Earnings",      icon: Icons.currency },
];

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Icons.home },
  { href: "/admin/users",     label: "Users",     icon: Icons.users },
  { href: "/admin/courses",   label: "Courses",   icon: Icons.bookOpen },
  { href: "/admin/reports",   label: "Reports",   icon: Icons.chartBar },
  { href: "/admin/settings",  label: "Settings",  icon: Icons.cog },
];

const bottomLinks = [
  { href: "/help", label: "Help Center", icon: Icons.questionCircle },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function Sidebar({ isOpen, onToggle, userType = "student" }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const links =
    userType === "tutor" ? tutorLinks
    : userType === "admin" ? adminLinks
    : studentLinks;

  const showVendorSection  = !!user?.isVendorProfileComplete;
  const showBecomeVendor   = !user?.isVendorProfileComplete && userType === "student";

  const NavItem = ({
    href, label, icon, accent = false,
  }: { href: string; label: string; icon: React.ReactNode; accent?: boolean }) => {
    const isActive = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        title={!isOpen ? label : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: isOpen ? "9px 14px" : "9px 0",
          margin: "1px 8px",
          borderRadius: 6,
          textDecoration: "none",
          fontSize: 13.5,
          fontWeight: isActive ? 700 : 400,
          color: isActive ? "#fff" : "#9ca3af",
          background: isActive
            ? accent ? "rgba(245,158,11,.2)" : "rgba(13,148,136,.25)"
            : "transparent",
          borderLeft: isActive
            ? `3px solid ${accent ? "#f59e0b" : "var(--brand)"}`
            : "3px solid transparent",
          transition: "all .15s",
          overflow: "hidden",
          whiteSpace: "nowrap",
          justifyContent: isOpen ? "flex-start" : "center",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,.06)";
            (e.currentTarget as HTMLElement).style.color = "#e5e7eb";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#9ca3af";
          }
        }}
      >
        <span style={{ color: isActive ? (accent ? "#f59e0b" : "var(--brand)") : "inherit", display: "flex" }}>
          {icon}
        </span>
        {isOpen && (
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div
      style={{
        width: "100%", height: "100%",
        background: "#151515",
        color: "#fff",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Section label */}
      {isOpen && (
        <div style={{ padding: "11px 16px", borderBottom: "1px solid rgba(255,255,255,.07)", flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--brand)" }}>
            Navigation
          </span>
        </div>
      )}

      {/* Nav links */}
      <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 0" }}>

        {links.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}

        {/* Vendor Tools section */}
        {showVendorSection && (
          <>
            <div style={{ margin: "10px 14px", height: 1, background: "rgba(255,255,255,.07)" }} />
            {isOpen && (
              <div style={{ padding: "3px 16px 6px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#f59e0b" }}>
                Vendor Tools
              </div>
            )}
            {vendorLinks.map((link) => (
              <NavItem key={link.href} {...link} accent />
            ))}
          </>
        )}

        <div style={{ margin: "10px 14px", height: 1, background: "rgba(255,255,255,.07)" }} />

        {bottomLinks.map((link) => (
          <NavItem key={link.href} {...link} />
        ))}
      </nav>

      {/* User profile + logout */}
      <div
        style={{
          padding: isOpen ? "12px 14px" : "12px 0",
          borderTop: "1px solid rgba(255,255,255,.07)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: isOpen ? "flex-start" : "center" }}>
          <Avatar src={user?.profileImage} firstName={user?.firstName || "U"} lastName={user?.lastName} size={32} />
          {isOpen && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "capitalize" }}>
                {user?.primaryRole || userType}
              </div>
            </div>
          )}
        </div>
        {isOpen && (
          <button
            onClick={() => { logout(); router.push("/"); }}
            style={{
              marginTop: 10, width: "100%", padding: "7px 10px",
              background: "rgba(220,38,38,.15)", border: "1px solid rgba(220,38,38,.25)",
              borderRadius: 5, color: "#f87171", fontSize: 12, fontWeight: 700,
              cursor: "pointer", textAlign: "center",
            }}
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  );
}
