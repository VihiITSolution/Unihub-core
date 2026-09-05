"use client";

import { useState, useEffect, useRef, type RefObject } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import enrollmentService, { Enrollment } from "@/services/enrollment.service";
import { BACKEND_URL } from "@/lib/constants";
import InlineSettings from "@/components/settings/InlineSettings";
import { Avatar } from "@/components/ui";

// ── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: "100%", height: 7, background: "#e2e8f0", borderRadius: 999, overflow: "hidden", margin: "6px 0" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, value)}%`,
          background: value === 100 ? "#16a34a" : "var(--brand)",
          borderRadius: 999,
          transition: "width .4s",
        }}
      />
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, cta, children }: {
  title: string; subtitle?: string;
  cta?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "22px 24px", marginBottom: 16 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "var(--ink)" }}>{title}</h2>
          {subtitle && <p style={{ margin: "5px 0 0", fontSize: 13, color: "var(--muted)" }}>{subtitle}</p>}
        </div>
        {cta && (
          <Link
            href={cta.href}
            style={{
              display: "inline-flex", alignItems: "center", height: 36, padding: "0 14px",
              border: "1.5px solid var(--ink)", borderRadius: 4,
              fontSize: 13, fontWeight: 800, color: "var(--ink)", textDecoration: "none",
              flexShrink: 0,
            }}
          >
            {cta.label}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Course progress row ───────────────────────────────────────────────────────
function CourseRow({ enrollment }: { enrollment: Enrollment }) {
  const course = enrollment.course!;
  const progress = enrollment.progress || 0;
  const tutorName = course.tutor
    ? `${course.tutor.firstName} ${course.tutor.lastName}`
    : "Instructor";

  const nextLabel =
    progress === 0 ? "Start learning" :
    progress === 100 ? "Review material" :
    "Keep going";

  return (
    <Link
      href={`/student/learn/${course.id}`}
      style={{ display: "block", textDecoration: "none", padding: "14px 0", borderBottom: "1px solid var(--line)" }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--ink)", marginBottom: 3 }}>{course.title}</div>
          <div style={{ fontSize: 12, color: "var(--brand)", fontWeight: 600 }}>
            Next: <span style={{ color: "var(--muted)", fontWeight: 400 }}>{nextLabel} · By {tutorName}</span>
          </div>
          <ProgressBar value={progress} />
          <div style={{ fontSize: 12, color: "var(--muted)" }}>{progress}% complete</div>
        </div>
        <span
          style={{
            flexShrink: 0, fontSize: 12, fontWeight: 700,
            padding: "4px 10px", borderRadius: 999,
            background: progress === 100 ? "#dcfce7" : progress > 0 ? "#dbeafe" : "#f1f5f9",
            color: progress === 100 ? "#166534" : progress > 0 ? "#1e40af" : "var(--muted)",
            marginTop: 2,
          }}
        >
          {progress === 100 ? "Completed" : progress > 0 ? "In progress" : "Enrolled"}
        </span>
      </div>
    </Link>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [activeSection, setActiveSection] = useState("courses");
  const [settingsPanel, setSettingsPanel] = useState<string | undefined>();

  useEffect(() => {
    loadEnrollments();

    // Re-fetch when the user comes back to this tab/page (e.g. after
    // enrolling in or completing a course elsewhere) - Next.js's router
    // cache can otherwise leave this component showing stale counts after
    // client-side back-navigation, since the mount-only effect above never
    // re-runs on its own.
    const handleFocus = () => loadEnrollments();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const result = await enrollmentService.getMyEnrollments();
      if (result.success && result.data?.enrollments) {
        const data = result.data.enrollments;
        setEnrollments(data);
        setCompletedCount(data.filter((e: any) => e.status === "completed" || e.progress === 100).length);
      }
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const navLinks = [
    { id: "courses",     label: "My courses" },
    { id: "wishlist",    label: "Wishlist" },
    { id: "saved",       label: "Saved marketplace & boarding" },
    { id: "profile",     label: "Profile and certificates" },
    { id: "settings",    label: "Settings" },
  ];

  const coursesRef  = useRef<HTMLDivElement>(null);
  const wishlistRef = useRef<HTMLDivElement>(null);
  const savedRef    = useRef<HTMLDivElement>(null);
  const profileRef  = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const sectionRefs: Record<string, RefObject<HTMLDivElement | null>> = {
    courses:  coursesRef,
    wishlist: wishlistRef,
    saved:    savedRef,
    profile:  profileRef,
    settings: settingsRef,
  };

  const scrollTo = (id: string) => {
    setActiveSection(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("section") !== "settings") return;
    const requestedPanel = params.get("setting");
    const allowedPanels = ["profile", "password", "notifications", "privacy", "accounts", "danger"];
    setActiveSection("settings");
    setSettingsPanel(requestedPanel && allowedPanels.includes(requestedPanel) ? requestedPanel : "profile");
    window.requestAnimationFrame(() => settingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }, []);

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 1100, margin: "0 auto", padding: "0 8px" }} className="ml-outer">

      {/* ── Left sidebar ── */}
      <aside
        className="ml-dashboard-aside"
        style={{
          width: 220, flexShrink: 0,
          position: "sticky", top: 120,
          background: "#fff", border: "1px solid var(--line)", borderRadius: 8,
          padding: "20px 0",
        }}
      >
        {/* Avatar + info */}
        <div style={{ padding: "0 20px 18px", borderBottom: "1px solid var(--line)" }}>
          <Avatar
            src={user?.profileImage}
            firstName={user?.firstName || "S"}
            lastName={user?.lastName}
            size={52}
            style={{ marginBottom: 12 }}
          />
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
            {user?.primaryRole === "student" ? "Student account" : user?.primaryRole}
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "10px 0" }}>
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 20px",
                background: activeSection === link.id ? "#f0fdf4" : "transparent",
                border: "none",
                borderLeft: activeSection === link.id ? "3px solid var(--brand)" : "3px solid transparent",
                fontSize: 13, fontWeight: activeSection === link.id ? 800 : 600,
                color: activeSection === link.id ? "var(--brand-dark)" : "var(--ink)",
                cursor: "pointer", transition: "all .15s",
              }}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Hero banner */}
        <div
          className="ml-hero"
          style={{
            background: "var(--brand-dark)",
            borderRadius: 8, padding: "28px 32px",
            marginBottom: 16, color: "#fff",
          }}
        >
          <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, lineHeight: 1.25 }}>
            Everything you saved, started,<br />bought, booked, or completed.
          </h1>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, opacity: .85, maxWidth: 560 }}>
            My Learning is your student home base: course progress, completed certificates, marketplace orders, boarding shortlists, and profile details in one place.
          </p>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }} className="ml-stat-grid">
          {[
            { value: enrollments.length - completedCount, label: "Active courses" },
            { value: 0,                   label: "Wishlist items" },
            { value: 0,                   label: "Saved rooms" },
            { value: completedCount,      label: "Completed" },
          ].map((s) => (
            <div
              key={s.label}
              style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: 8, padding: "16px 18px" }}
            >
              <div style={{ fontSize: 28, fontWeight: 800, color: "var(--ink)", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Continue Learning */}
        <div ref={coursesRef}>
          <Section
            title="Continue learning"
            subtitle="Pick up from your last lecture, assignment checklist, or revision video."
            cta={{ label: "Find more", href: "/courses" }}
          >
            {loading ? (
              <div style={{ padding: "16px 0" }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ paddingBottom: 16, borderBottom: "1px solid var(--line)", marginBottom: 16 }}>
                    <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 10, width: "40%", marginBottom: 10 }} />
                    <div className="skeleton" style={{ height: 7, borderRadius: 999 }} />
                  </div>
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div style={{ padding: "28px 0", textAlign: "center" }}>
                <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--muted)" }}>
                  You haven't enrolled in any courses yet.
                </p>
                <Link
                  href="/courses"
                  style={{
                    display: "inline-flex", alignItems: "center",
                    height: 40, padding: "0 18px",
                    background: "var(--brand)", color: "#fff",
                    fontSize: 13, fontWeight: 800, borderRadius: 5,
                    textDecoration: "none",
                  }}
                >
                  Browse Kuppi Sessions
                </Link>
              </div>
            ) : (
              <div>
                {enrollments.map((e) =>
                  e.course ? <CourseRow key={e.id} enrollment={e} /> : null
                )}
              </div>
            )}
          </Section>
        </div>

        {/* Wishlist + Saved — two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }} className="ml-two-col">
          {/* Wishlist */}
          <div ref={wishlistRef}>
            <Section
              title="Wishlist"
              subtitle="Modules, tutors, videos, and marketplace items you want to return to later."
            >
              <div style={{ padding: "8px 0", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                No wishlist items yet.{" "}
                <Link href="/courses" style={{ color: "var(--brand)", fontWeight: 700 }}>Browse courses</Link>
              </div>
            </Section>
          </div>

          {/* Saved student life */}
          <div ref={savedRef}>
            <Section
              title="Saved student life"
              subtitle="Track the non-course things that still decide how your semester feels."
            >
              <div style={{ padding: "8px 0", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                No saved items yet.{" "}
                <Link href="/marketplace" style={{ color: "var(--brand)", fontWeight: 700 }}>Explore marketplace</Link>
              </div>
            </Section>
          </div>
        </div>

        {/* Profile & Certificates */}
        <div ref={profileRef} style={{ scrollMarginTop: 120 }}>
          <Section
            title="Profile, certificates, and account"
            subtitle="Your account can hold student details, faculty, year, certificates, payment history, tutor bookings, and privacy settings."
            cta={{ label: "Edit profile", href: "/student/dashboard?section=settings&setting=profile" }}
          >
            {completedCount === 0 ? (
              <div style={{ padding: "8px 0", color: "var(--muted)", fontSize: 13, textAlign: "center" }}>
                Complete a course to earn your first certificate.
              </div>
            ) : (
              <div>
                {enrollments
                  .filter((e) => e.status === "completed" || e.progress === 100)
                  .map((e) => (
                    <div
                      key={e.id}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 0", borderBottom: "1px solid var(--line)",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--ink)" }}>
                        Completed:{" "}
                        <Link href={`/student/learn/${e.course?.id}`} style={{ color: "var(--brand)", fontWeight: 700, textDecoration: "none" }}>
                          {e.course?.title}
                        </Link>
                      </span>
                      <span style={{ fontWeight: 800, color: "var(--brand-dark)", flexShrink: 0, marginLeft: 16 }}>
                        Certificate ready
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </Section>
        </div>

        {/* Settings */}
        <div ref={settingsRef} style={{ scrollMarginTop: 120 }}>
          <Section
            title="Settings"
            subtitle="Manage your account preferences, security, and notifications."
          >
            <InlineSettings initialOpen={settingsPanel} />
          </Section>
        </div>

      </div>{/* end main content */}

      <style jsx>{`
        @media (max-width: 768px) {
          .ml-outer { padding: 0 4px !important; }
          .ml-dashboard-aside { display: none !important; }
          .ml-hero { padding: 18px 16px !important; }
          .ml-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .ml-two-col   { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
