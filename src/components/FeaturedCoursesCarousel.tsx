"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/types";
import { API_BASE_URL } from "@/lib/constants";

interface CategoryTab {
  id: string;
  name: string;
}

const TOPICS = [
  { id: "all", label: "Featured" },
  { id: "computing", label: "Computing" },
  { id: "business", label: "Management" },
  { id: "engineering", label: "Engineering" },
  { id: "medicine", label: "Medicine" },
  { id: "humanities", label: "Humanities" },
  { id: "exam", label: "Exams" },
];

const YEARS = [
  { id: "all", label: "All Years" },
  { id: "1", label: "First Year" },
  { id: "2", label: "Second Year" },
  { id: "3", label: "Third Year" },
  { id: "4", label: "Fourth Year" },
];

const QUICK_FILTERS = [
  { label: "Assignment help", query: "assignment" },
  { label: "Final exam prep", query: "final exam" },
  { label: "Viva practice", query: "viva" },
  { label: "Research project", query: "research" },
  { label: "Internship skills", query: "internship" },
  { label: "Foundation year", query: "foundation" },
];

const TOPIC_TEXT: Record<string, [string, string]> = {
  all: ["Featured kuppi sessions", "Browse sessions mapped to Sri Lankan faculties, course codes, assessments, and semester needs."],
  computing: ["Faculty of Computing", "Software engineering, data science, information systems, research projects, and portfolio-ready technical modules."],
  business: ["Faculty of Management Studies", "Marketing, management, accounting, entrepreneurship, group assignments, vivas, and internship communication."],
  engineering: ["Faculty of Engineering", "Lab support, circuit theory, reports, design calculations, and final exam revision."],
  medicine: ["Faculty of Medicine", "Health science, nursing, public health, anatomy, and evidence-based study support."],
  humanities: ["Humanities and Social Sciences", "Academic English, presentations, writing, psychology, law, and foundation-year support."],
  exam: ["Exam prep and certification support", "Prepare for final exams, supplementary exams, vivas, and professional certification pathways."],
};

export default function FeaturedCoursesCarousel() {
  const { user, token, isAuthenticated } = useAuth();
  const [allCourses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("all");
  const [activeYear, setActiveYear] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCourses();
  }, [isAuthenticated, token]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(`${API_BASE_URL}/courses?limit=100&page=1`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const data = (result.data as any).courses || result.data;
          setCourses(Array.isArray(data) ? data : []);
        }
      }
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCourses = (): Course[] => {
    return allCourses.filter((course) => {
      const facultyName = (course.categoryObj?.name || course.faculty?.name || course.category || "").toLowerCase();

      const topicMatch =
        activeTopic === "all" ||
        (activeTopic === "computing" && (facultyName.includes("computing") || facultyName.includes("it") || facultyName.includes("software"))) ||
        (activeTopic === "business" && (facultyName.includes("management") || facultyName.includes("business") || facultyName.includes("commerce"))) ||
        (activeTopic === "engineering" && facultyName.includes("engineer")) ||
        (activeTopic === "medicine" && (facultyName.includes("medicine") || facultyName.includes("health") || facultyName.includes("nursing"))) ||
        (activeTopic === "humanities" && (facultyName.includes("humanit") || facultyName.includes("arts") || facultyName.includes("english"))) ||
        (activeTopic === "exam" && (facultyName.includes("exam") || facultyName.includes("foundation") || facultyName.includes("prep")));

      const yearVal = String(course.year || "");
      const yearMatch =
        activeYear === "all" ||
        (activeYear === "1" && yearVal === "1") ||
        (activeYear === "2" && yearVal === "2") ||
        (activeYear === "3" && yearVal === "3") ||
        (activeYear === "4" && yearVal === "4");

      const q = searchQuery.toLowerCase();
      const textMatch =
        !q ||
        course.title.toLowerCase().includes(q) ||
        (course.description || "").toLowerCase().includes(q) ||
        (course.tutor
          ? `${course.tutor.firstName} ${course.tutor.lastName}`.toLowerCase().includes(q)
          : false);

      return topicMatch && yearMatch && textMatch;
    });
  };

  const courses = getFilteredCourses();
  const [titleText, copyText] = TOPIC_TEXT[activeTopic] || TOPIC_TEXT.all;
  const showYearFilter = activeTopic === "all" || activeTopic === "computing";

  return (
    <section style={{ padding: "34px 0" }}>
      <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
        {/* Section head */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>
              Search like you are planning your semester
            </h2>
            <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
              Filter by faculty, then search course codes, lecturers, modules, GPA support, assignments, vivas, or exam topics.
            </p>
          </div>
          <Link
            href="/courses"
            style={{
              minHeight: 40, display: "inline-grid", placeItems: "center",
              padding: "0 14px", border: "1px solid var(--ink)",
              background: "var(--white)", color: "var(--ink)",
              fontSize: 14, fontWeight: 800, whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            View all
          </Link>
        </div>

        {/* Topic tabs */}
        <div
          style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, scrollbarWidth: "none" }}
          className="scrollbar-hide"
          role="tablist"
        >
          {TOPICS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTopic(tab.id); setActiveYear("all"); setSearchQuery(""); }}
              style={{
                minHeight: 42, padding: "0 16px",
                border: `1px solid ${activeTopic === tab.id ? "var(--ink)" : "var(--line)"}`,
                borderRadius: 999,
                background: activeTopic === tab.id ? "var(--ink)" : "var(--white)",
                color: activeTopic === tab.id ? "#fff" : "var(--ink)",
                fontSize: 14, fontWeight: 800, cursor: "pointer", whiteSpace: "nowrap",
                transition: "all .15s",
              }}
              role="tab"
              aria-selected={activeTopic === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Year filter chips */}
        {showYearFilter && (
          <div
            style={{
              display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8,
              margin: "12px 0 2px", padding: 12,
              border: "1px solid #d7ebe5", borderRadius: 6, background: "#f2fbf8",
            }}
          >
            <span style={{ marginRight: 4, color: "var(--brand-dark)", fontSize: 13, fontWeight: 800 }}>
              Year filter:
            </span>
            {YEARS.map((yr) => (
              <button
                key={yr.id}
                onClick={() => setActiveYear(yr.id)}
                style={{
                  minHeight: 34, padding: "0 12px",
                  border: `1px solid ${activeYear === yr.id ? "var(--brand)" : "var(--line)"}`,
                  borderRadius: 999,
                  background: activeYear === yr.id ? "#e8f6f1" : "var(--white)",
                  color: activeYear === yr.id ? "var(--brand-dark)" : "var(--ink)",
                  fontSize: 13, fontWeight: 800, cursor: "pointer",
                }}
              >
                {yr.label}
              </button>
            ))}
          </div>
        )}

        {/* Quick filter chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0 2px" }}>
          {QUICK_FILTERS.map((chip) => (
            <button
              key={chip.query}
              onClick={() => setSearchQuery(chip.query)}
              style={{
                minHeight: 34, padding: "0 12px",
                border: `1px solid ${searchQuery === chip.query ? "var(--brand)" : "var(--line)"}`,
                borderRadius: 999,
                background: searchQuery === chip.query ? "#e8f6f1" : "var(--white)",
                color: searchQuery === chip.query ? "var(--brand-dark)" : "var(--ink)",
                fontSize: 13, fontWeight: 800, cursor: "pointer",
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Panel with title */}
        <div
          style={{
            marginTop: 12, padding: 22,
            border: "1px solid var(--line)", background: "var(--soft)",
          }}
        >
          <h3 style={{ margin: "0 0 8px", fontSize: 23, fontWeight: 800 }}>{titleText}</h3>
          <p style={{ maxWidth: 760, margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>
            {copyText}
          </p>

          {/* Course grid */}
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 18,
              }}
              className="course-grid-responsive"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden", background: "var(--white)" }}
                >
                  <div style={{ width: "100%", aspectRatio: "16/9", background: "#e6e6e6" }} className="skeleton" />
                  <div style={{ padding: 12 }}>
                    <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                    <div className="skeleton" style={{ height: 12, width: "60%" }} />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div
              style={{
                padding: 24, border: "1px dashed var(--line)",
                background: "var(--white)", color: "var(--muted)", textAlign: "center",
              }}
            >
              No kuppi sessions match your search yet.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 18,
              }}
              className="course-grid-responsive"
            >
              {courses.slice(0, 12).map((course) => (
                <CourseCard key={course.id} course={course} user={user} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .course-grid-responsive {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          .course-grid-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}

function CourseCard({ course, user }: { course: Course; user: any }) {
  const tutorName = course.tutor
    ? `${course.tutor.firstName} ${course.tutor.lastName}`
    : (course as any).tutorName || "Instructor";

  const facultyLabel =
    course.categoryObj?.name || course.faculty?.name || (course as any).category || "";

  const priceLabel =
    course.price === 0 || parseFloat(String(course.price)) === 0
      ? "FREE"
      : `LKR ${Number(course.price).toLocaleString()}`;

  const badge = course.isUpcoming ? "Upcoming" : course.year ? `Year ${course.year}` : course.level || "Course";

  const isOwner = user && course.tutorId === user.id;

  const cardContent = (
    <article
      style={{
        position: "relative",
        minWidth: 0,
        background: "var(--white)",
        border: "1px solid var(--line)",
        borderRadius: 6,
        overflow: "hidden",
        transition: "transform .18s ease, box-shadow .18s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
      className="course-card-hover"
    >
      {/* Thumbnail */}
      <img
        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#e6e6e6" }}
        src={
          course.thumbnail ||
          "/library-study-group.png"
        }
        alt={course.title}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "/library-study-group.png";
        }}
      />

      {/* Body */}
      <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column" }}>
        <h4
          style={{
            minHeight: 44, margin: "0 0 6px",
            fontSize: 15, lineHeight: 1.25, fontWeight: 800, color: "var(--ink)",
          }}
        >
          {course.title}
        </h4>
        <div style={{ color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          By {tutorName}
        </div>

        {/* Meta tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "8px 0 0" }}>
          {facultyLabel && (
            <span style={{ padding: "3px 6px", background: "var(--soft)", border: "1px solid #ececec", color: "var(--muted)", fontSize: 12 }}>
              {facultyLabel}
            </span>
          )}
          {course.year && (
            <span style={{ padding: "3px 6px", background: "var(--soft)", border: "1px solid #ececec", color: "var(--muted)", fontSize: 12 }}>
              Year {course.year}
            </span>
          )}
        </div>

        {/* Rating */}
        {course.rating && Number(course.rating) > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 0", color: "var(--gold)", fontSize: 14, fontWeight: 800 }}>
            {Number(course.rating).toFixed(1)} ★
            <span style={{ color: "var(--muted)", fontWeight: 400 }}>
              ({(course.enrollmentCount || 0).toLocaleString()})
            </span>
          </div>
        )}

        {/* Price row */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 8, marginTop: "auto", paddingTop: 8,
            fontWeight: 800, fontSize: 14,
          }}
        >
          <span>{priceLabel}</span>
          <span
            style={{
              display: "inline-flex", alignItems: "center",
              height: 25, padding: "0 8px",
              background: "#e8f6f1", color: "var(--brand-dark)",
              fontSize: 12, fontWeight: 800,
            }}
          >
            {badge}
          </span>
        </div>
      </div>
    </article>
  );

  if (isOwner) {
    return <Link href={`/tutor/edit-course/${course.id}`} style={{ textDecoration: "none" }}>{cardContent}</Link>;
  }
  if ((course as any).isEnrolled) {
    return <Link href={`/student/learn/${course.id}`} style={{ textDecoration: "none" }}>{cardContent}</Link>;
  }
  return <Link href={`/courses/${course.id}`} style={{ textDecoration: "none" }}>{cardContent}</Link>;
}
