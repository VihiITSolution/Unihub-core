"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import enrollmentService, { Enrollment } from "@/services/enrollment.service";
import { BACKEND_URL } from "@/lib/constants";

type FilterTab = "all" | "in_progress" | "completed";

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
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

function StatusBadge({ status, progress }: { status: string; progress: number }) {
  const isComplete = status === "completed" || progress === 100;
  const isActive   = !isComplete && progress > 0;

  const cfg = isComplete
    ? { label: "Completed",   bg: "#dcfce7", color: "#166534" }
    : isActive
    ? { label: "In Progress", bg: "#dbeafe", color: "#1e40af" }
    : { label: "Enrolled",    bg: "#e8f6f1", color: "var(--brand-dark)" };

  return (
    <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const result = await enrollmentService.getMyEnrollments();
      if (result.success && result.data?.enrollments) {
        setEnrollments(result.data.enrollments);
      }
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = enrollments.filter((e) => {
    if (filter === "all") return true;
    if (filter === "completed") return e.status === "completed" || e.progress === 100;
    if (filter === "in_progress") return e.status === "in_progress" || (e.progress > 0 && e.progress < 100);
    return true;
  });

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "all",         label: `All (${enrollments.length})` },
    { id: "in_progress", label: `In Progress (${enrollments.filter(e => e.progress > 0 && e.progress < 100).length})` },
    { id: "completed",   label: `Completed (${enrollments.filter(e => e.status === "completed" || e.progress === 100).length})` },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "var(--brand)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          My Learning
        </p>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--ink)" }}>My Courses</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "var(--muted)" }}>
          All your enrolled kuppi sessions and courses in one place.
        </p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, borderBottom: "1px solid var(--line)", paddingBottom: 0 }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: "10px 16px",
              border: "none", background: "transparent",
              fontSize: 14, fontWeight: filter === tab.id ? 800 : 500,
              color: filter === tab.id ? "var(--brand-dark)" : "var(--muted)",
              borderBottom: filter === tab.id ? "2px solid var(--brand)" : "2px solid transparent",
              cursor: "pointer", transition: "all .15s",
              marginBottom: -1,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="mc-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
              <div style={{ width: "100%", aspectRatio: "16/9", background: "#e6e6e6" }} className="skeleton" />
              <div style={{ padding: 16 }}>
                <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: "50%", marginBottom: 16 }} />
                <div className="skeleton" style={{ height: 6, borderRadius: 999 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: 8, background: "#fff" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
          <p style={{ margin: "0 0 16px", fontSize: 15, color: "var(--muted)" }}>
            {filter === "all"
              ? "You haven't enrolled in any courses yet."
              : `No ${filter.replace("_", " ")} courses.`}
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }} className="mc-grid">
          {filtered.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            const progress = enrollment.progress || 0;
            const isComplete = enrollment.status === "completed" || progress === 100;
            const tutorName = course.tutor
              ? `${course.tutor.firstName} ${course.tutor.lastName}`
              : "Instructor";
            const thumbSrc = course.thumbnail
              ? course.thumbnail.startsWith("http") ? course.thumbnail : `${BACKEND_URL}${course.thumbnail}`
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
                  {isComplete && (
                    <div
                      style={{
                        position: "absolute", inset: 0,
                        background: "rgba(22,163,74,.12)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <span style={{ fontSize: 36 }}>✓</span>
                    </div>
                  )}
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

                  {/* Progress */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginBottom: 5 }}>
                      <span>Progress</span>
                      <span style={{ fontWeight: 700, color: isComplete ? "#16a34a" : "var(--ink)" }}>{progress}%</span>
                    </div>
                    <ProgressBar value={progress} />
                  </div>

                  <StatusBadge status={enrollment.status || "enrolled"} progress={progress} />

                  {/* CTA */}
                  <Link
                    href={`/student/learn/${course.id}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginTop: "auto", padding: "10px 0",
                      background: isComplete ? "#f1f5f9" : "var(--ink)",
                      color: isComplete ? "var(--ink)" : "#fff",
                      fontSize: 13, fontWeight: 800, borderRadius: 5,
                      textDecoration: "none",
                      border: isComplete ? "1px solid var(--line)" : "none",
                    }}
                  >
                    {isComplete ? "Review Course" : progress > 0 ? "Continue Learning" : "Start Learning"}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 900px) { .mc-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 580px) { .mc-grid { grid-template-columns: 1fr !important; } }
        .course-card-hover:hover { box-shadow: 0 4px 20px rgba(0,0,0,.1); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
