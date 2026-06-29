"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import enrollmentService, { Enrollment } from "@/services/enrollment.service";
import { BACKEND_URL } from "@/lib/constants";

function StatCard({
  value, label, color,
}: { value: React.ReactNode; label: string; color: string }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 8,
        padding: "22px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <span style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: 14, color: "var(--muted)" }}>{label}</span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: "100%", height: 6, background: "#e5e7eb", borderRadius: 999, overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, value)}%`,
          background: value === 100 ? "#16a34a" : "var(--brand)",
          borderRadius: 999,
          transition: "width .4s ease",
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    completed:   { label: "Completed",   bg: "#dcfce7", color: "#166534" },
    in_progress: { label: "In Progress", bg: "#dbeafe", color: "#1e40af" },
    enrolled:    { label: "Enrolled",    bg: "#e8f6f1", color: "var(--brand-dark)" },
  };
  const s = map[status] ?? map.enrolled;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "4px 10px", borderRadius: 999,
        fontSize: 12, fontWeight: 700,
        background: s.bg, color: s.color,
      }}
    >
      {s.label}
    </span>
  );
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalLearningTime, setTotalLearningTime] = useState(0);

  useEffect(() => { loadEnrollments(); }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const result = await enrollmentService.getMyEnrollments();
      if (result.success && result.data?.enrollments) {
        const data = result.data.enrollments;
        setEnrollments(data);
        setCompletedCount(data.filter((e: any) => e.status === "completed" || e.progress === 100).length);
        setTotalLearningTime(data.reduce((sum: number, e: any) => sum + (e.course?.duration || 0), 0));
      }
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Student Dashboard
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--ink)" }}>
          {user?.firstName ? `Welcome back, ${user.firstName}` : "My Learning"}
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted)" }}>
          Track your progress and continue where you left off.
        </p>
      </div>

      {/* Stat cards */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 36 }}
        className="stat-grid-responsive"
      >
        <StatCard value={enrollments.length} label="Enrolled Courses" color="var(--brand)" />
        <StatCard value={completedCount} label="Completed Courses" color="#16a34a" />
        <StatCard value={`${totalLearningTime}h`} label="Learning Time" color="#f59e0b" />
      </div>

      {/* Continue Learning */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>Continue Learning</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted)" }}>
              Pick up where you left off
            </p>
          </div>
          <Link
            href="/courses"
            style={{
              display: "inline-flex", alignItems: "center",
              height: 36, padding: "0 14px",
              border: "1px solid var(--ink)", borderRadius: 4,
              fontSize: 13, fontWeight: 800, color: "var(--ink)",
              textDecoration: "none", background: "#fff",
              transition: "background .15s",
            }}
          >
            Browse Courses
          </Link>
        </div>

        {loading ? (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            className="course-grid-responsive"
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
                <div style={{ width: "100%", aspectRatio: "16/9", background: "#e6e6e6" }} className="skeleton" />
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 18, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 16 }} />
                  <div className="skeleton" style={{ height: 8, borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div
            style={{
              padding: "48px 24px", textAlign: "center",
              border: "1px dashed var(--line)", borderRadius: 8, background: "#fff",
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
            <p style={{ margin: "0 0 16px", fontSize: 15, color: "var(--muted)" }}>
              You haven't enrolled in any courses yet.
            </p>
            <Link
              href="/courses"
              style={{
                display: "inline-flex", alignItems: "center",
                height: 42, padding: "0 20px",
                background: "var(--brand)", color: "#fff",
                fontSize: 14, fontWeight: 800, borderRadius: 5,
                textDecoration: "none",
              }}
            >
              Browse Kuppi Sessions
            </Link>
          </div>
        ) : (
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            className="course-grid-responsive"
          >
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              const progress = enrollment.progress || 0;
              const tutorName = course.tutor
                ? `${course.tutor.firstName} ${course.tutor.lastName}`
                : "Instructor";
              const thumbSrc = course.thumbnail
                ? course.thumbnail.startsWith("http")
                  ? course.thumbnail
                  : `${BACKEND_URL}${course.thumbnail}`
                : "/library-study-group.png";

              return (
                <article
                  key={enrollment.id}
                  style={{
                    background: "#fff", border: "1px solid var(--line)",
                    borderRadius: 8, overflow: "hidden",
                    display: "flex", flexDirection: "column",
                    transition: "box-shadow .18s, transform .18s",
                  }}
                  className="course-card-hover"
                >
                  {/* Thumbnail */}
                  <div style={{ position: "relative" }}>
                    <img
                      src={thumbSrc}
                      alt={course.title}
                      style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#e6e6e6" }}
                      onError={(e) => { (e.target as HTMLImageElement).src = "/library-study-group.png"; }}
                    />
                    {/* Progress overlay pill */}
                    <div
                      style={{
                        position: "absolute", bottom: 8, right: 8,
                        background: "rgba(0,0,0,.65)", color: "#fff",
                        fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 999,
                      }}
                    >
                      {progress}%
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: "var(--ink)" }}>
                      {course.title}
                    </h3>
                    <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>By {tutorName}</p>

                    {/* Progress bar */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: 700, color: progress === 100 ? "#16a34a" : "var(--ink)" }}>{progress}%</span>
                      </div>
                      <ProgressBar value={progress} />
                    </div>

                    <div style={{ marginTop: 2 }}>
                      <StatusBadge status={enrollment.status || "enrolled"} />
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/student/learn/${course.id}`}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginTop: "auto", padding: "10px 0",
                        background: progress === 100 ? "#f1f5f9" : "var(--ink)",
                        color: progress === 100 ? "var(--ink)" : "#fff",
                        fontSize: 13, fontWeight: 800, borderRadius: 5,
                        textDecoration: "none", border: progress === 100 ? "1px solid var(--line)" : "none",
                        transition: "opacity .15s",
                      }}
                    >
                      {progress === 100 ? "Review Course" : "Continue Learning"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ marginTop: 40, paddingTop: 28, borderTop: "1px solid var(--line)" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 800, color: "var(--ink)" }}>
          Quick Access
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }} className="quick-links-responsive">
          {[
            { href: "/courses",                   label: "Browse Courses",  icon: "📚", desc: "Find kuppi sessions" },
            { href: "/student/live-sessions",     label: "Live Sessions",   icon: "🎥", desc: "Join upcoming sessions" },
            { href: "/marketplace",               label: "Marketplace",     icon: "🛍️", desc: "Buy student essentials" },
            { href: "/boarding",                  label: "Boarding",        icon: "🏡", desc: "Find rooms near campus" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", flexDirection: "column", gap: 6,
                padding: "16px 14px",
                background: "#fff", border: "1px solid var(--line)", borderRadius: 8,
                textDecoration: "none", color: "var(--ink)",
                transition: "border-color .15s, box-shadow .15s",
              }}
              className="quick-link-card"
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 800 }}>{item.label}</span>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.desc}</span>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .stat-grid-responsive { grid-template-columns: 1fr !important; }
          .course-grid-responsive { grid-template-columns: 1fr !important; }
          .quick-links-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .stat-grid-responsive { grid-template-columns: repeat(3, 1fr) !important; }
          .course-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
        .course-card-hover:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,.1);
          transform: translateY(-2px);
        }
        .quick-link-card:hover {
          border-color: var(--brand) !important;
          box-shadow: 0 2px 10px rgba(11,107,95,.1);
        }
      `}</style>
    </div>
  );
}
