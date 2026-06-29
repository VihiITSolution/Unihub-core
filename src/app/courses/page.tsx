"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/types";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";

interface Faculty {
  id: number;
  name: string;
  icon: string;
}

const YEARS = [
  { id: "all", label: "All Years" },
  { id: "1", label: "1st Year" },
  { id: "2", label: "2nd Year" },
  { id: "3", label: "3rd Year" },
  { id: "4", label: "4th Year" },
];

const PRICE_RANGES = [
  { id: "all", label: "All Prices" },
  { id: "free", label: "Free" },
  { id: "under1000", label: "Under Rs. 1000" },
  { id: "1000to2000", label: "Rs. 1000 – 2000" },
  { id: "over2000", label: "Over Rs. 2000" },
];

export default function CoursesPage() {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { loadFaculties(); }, []);
  useEffect(() => { loadCourses(); }, [selectedFaculty, selectedYear, priceRange, searchQuery, token]);

  const loadFaculties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/faculties?active=true`);
      const data = await response.json();
      if (data.success && data.data && Array.isArray(data.data.faculties)) {
        setFaculties([{ id: 0, name: "All Faculties", icon: "" }, ...data.data.faculties]);
      } else {
        setFaculties([
          { id: 0, name: "All Faculties", icon: "" },
          { id: 1, name: "Computing", icon: "" },
          { id: 2, name: "Engineering", icon: "" },
          { id: 3, name: "Medicine", icon: "" },
          { id: 4, name: "Business", icon: "" },
          { id: 5, name: "Arts", icon: "" },
        ]);
      }
    } catch {
      setFaculties([
        { id: 0, name: "All Faculties", icon: "" },
        { id: 1, name: "Computing", icon: "" },
        { id: 2, name: "Engineering", icon: "" },
        { id: 3, name: "Medicine", icon: "" },
        { id: 4, name: "Business", icon: "" },
      ]);
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string | number> = {};
      if (selectedFaculty !== "all") filters.facultyId = selectedFaculty;
      if (selectedYear !== "all") filters.year = selectedYear;
      if (searchQuery) filters.search = searchQuery;
      if (priceRange === "free") filters.maxPrice = 0;
      else if (priceRange === "under1000") filters.maxPrice = 1000;
      else if (priceRange === "1000to2000") { filters.minPrice = 1000; filters.maxPrice = 2000; }
      else if (priceRange === "over2000") filters.minPrice = 2000;

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => queryParams.append(k, String(v)));
      const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await fetch(`${API_BASE_URL}/courses${query}`, { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const data = Array.isArray(result.data) ? result.data : result.data.courses || [];
          setCourses(data);
        } else {
          setCourses([]);
        }
      } else {
        setCourses([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses.");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedFaculty("all");
    setSelectedYear("all");
    setPriceRange("all");
    setSearchQuery("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero */}
      <section
        style={{
          background: "linear-gradient(90deg, rgba(7,63,56,.95), rgba(7,63,56,.80))",
          color: "#fff",
        }}
      >
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "48px 0" }}>
          <p style={{ margin: "0 0 10px", color: "#a9f0df", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            UniHub Kuppi Sessions
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.05, fontWeight: 800 }}>
            Explore All Kuppi Sessions
          </h1>
          <p style={{ margin: 0, fontSize: 17, color: "#d7f4ec", maxWidth: 580, lineHeight: 1.5 }}>
            Discover peer-led sessions for every faculty, module, assignment type, and exam topic. Learn from students who have already mastered your course.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <div style={{ background: "var(--soft)", borderBottom: "1px solid var(--line)", padding: "14px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <form
            onSubmit={(e) => { e.preventDefault(); loadCourses(); }}
            style={{ display: "flex", gap: 10 }}
          >
            <div
              style={{
                flex: 1, display: "flex", alignItems: "center", gap: 10,
                height: 46, padding: "0 16px",
                border: "1px solid var(--ink)", borderRadius: 999, background: "var(--white)",
              }}
            >
              <span style={{ color: "var(--muted)", fontSize: 14 }}>Find</span>
              <input
                type="search"
                placeholder="Code, module, kuppi, lecturer, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--ink)", fontSize: 14 }}
              />
            </div>
            {(selectedFaculty !== "all" || selectedYear !== "all" || priceRange !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  height: 46, padding: "0 16px",
                  border: "1px solid var(--line)", background: "var(--white)",
                  color: "var(--muted)", fontSize: 14, cursor: "pointer", borderRadius: 4,
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "28px 0" }}>
        <div style={{ display: "flex", gap: 24 }} className="courses-layout">
          {/* Sidebar filters */}
          <aside style={{ width: 224, flexShrink: 0, alignSelf: "start" }} className="courses-sidebar">
            {/* Faculty */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                Faculty
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {faculties.map((f) => {
                  const fId = f.id === 0 ? "all" : String(f.id);
                  const active = selectedFaculty === fId;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFaculty(fId)}
                      style={{
                        display: "block", width: "100%", textAlign: "left",
                        padding: "8px 10px", border: "none", cursor: "pointer",
                        background: active ? "#e8f6f1" : "transparent",
                        color: active ? "var(--brand-dark)" : "var(--ink)",
                        fontWeight: active ? 800 : 400, fontSize: 14, borderRadius: 4,
                      }}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Year */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                Year
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {YEARS.map((y) => (
                  <button
                    key={y.id}
                    onClick={() => setSelectedYear(y.id)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 10px", border: "none", cursor: "pointer",
                      background: selectedYear === y.id ? "#e8f6f1" : "transparent",
                      color: selectedYear === y.id ? "var(--brand-dark)" : "var(--ink)",
                      fontWeight: selectedYear === y.id ? 800 : 400, fontSize: 14, borderRadius: 4,
                    }}
                  >
                    {y.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
                Price
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {PRICE_RANGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPriceRange(p.id)}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "8px 10px", border: "none", cursor: "pointer",
                      background: priceRange === p.id ? "#e8f6f1" : "transparent",
                      color: priceRange === p.id ? "var(--brand-dark)" : "var(--ink)",
                      fontWeight: priceRange === p.id ? 800 : 400, fontSize: 14, borderRadius: 4,
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Course grid */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
                Showing <strong style={{ color: "var(--ink)" }}>{courses.length}</strong> kuppi sessions
              </p>
            </div>

            {loading ? (
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
                className="course-result-grid"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 6, overflow: "hidden" }}>
                    <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
                    <div style={{ padding: 12 }}>
                      <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 14, width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                style={{
                  padding: 24, border: "1px solid #fca5a5", borderRadius: 6,
                  background: "#fef2f2", color: "#991b1b", textAlign: "center",
                }}
              >
                <p style={{ margin: "0 0 12px" }}>⚠️ {error}</p>
                <button
                  onClick={loadCourses}
                  style={{ padding: "8px 16px", background: "var(--ink)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}
                >
                  Try Again
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div
                style={{
                  padding: 48, border: "1px solid var(--line)", borderRadius: 6,
                  background: "var(--soft)", textAlign: "center",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
                <h3 style={{ margin: "0 0 8px" }}>No kuppi sessions found</h3>
                <p style={{ margin: 0, color: "var(--muted)" }}>Try adjusting your filters to see more results</p>
              </div>
            ) : (
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
                className="course-result-grid"
              >
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} user={user} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .courses-layout { flex-direction: column !important; }
          .courses-sidebar { width: 100% !important; }
          .course-result-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .course-result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function CourseCard({ course, user }: { course: Course; user: any }) {
  const tutorName = course.tutor
    ? `${course.tutor.firstName} ${course.tutor.lastName}`
    : (course as any).tutorName || "Instructor";

  const thumbnail =
    course.thumbnail && course.thumbnail.startsWith("http")
      ? course.thumbnail
      : course.thumbnail
      ? `${BACKEND_URL}${course.thumbnail}`
      : "/library-study-group.png";

  const priceLabel =
    course.price === 0 || parseFloat(String(course.price)) === 0
      ? "FREE"
      : `Rs. ${Number(course.price).toLocaleString()}`;

  const facultyLabel =
    course.faculty?.name || course.categoryObj?.name || (course as any).category || "";

  const isOwner = user && course.tutorId === user.id;

  const card = (
    <article
      style={{
        background: "var(--white)", border: "1px solid var(--line)",
        borderRadius: 6, overflow: "hidden",
        transition: "transform .18s, box-shadow .18s",
        cursor: "pointer",
      }}
      className="course-card-hover"
    >
      {/* Thumbnail */}
      <div style={{ position: "relative" }}>
        <img
          src={thumbnail}
          alt={course.title}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).src = "/library-study-group.png"; }}
        />
        {course.isUpcoming && (
          <span
            style={{
              position: "absolute", top: 8, left: 8,
              background: "#f97316", color: "#fff",
              fontSize: 11, fontWeight: 800, padding: "3px 8px",
            }}
          >
            UPCOMING
          </span>
        )}
        {course.rating && Number(course.rating) > 0 && (
          <span
            style={{
              position: "absolute", top: 8, right: 8,
              background: "#fef3c7", color: "#92400e",
              fontSize: 11, fontWeight: 800, padding: "3px 6px",
            }}
          >
            ⭐ {Number(course.rating).toFixed(1)}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px" }}>
        {facultyLabel && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 12, fontWeight: 800, padding: "3px 8px" }}>
              {facultyLabel}
            </span>
          </div>
        )}
        <h3 style={{ margin: "0 0 6px", fontSize: 16, lineHeight: 1.25, fontWeight: 800, color: "var(--ink)" }}>
          {course.title}
        </h3>
        <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: 13 }}>By {tutorName}</p>

        {course.year && (
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <span style={{ background: "var(--soft)", border: "1px solid #ececec", padding: "3px 6px", fontSize: 12, color: "var(--muted)" }}>
              Year {course.year}
            </span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--line)", marginTop: 8 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>{priceLabel}</span>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>
            {(course.enrollmentCount || 0).toLocaleString()} enrolled
          </span>
        </div>

        {/* Action row */}
        <div style={{ marginTop: 10 }}>
          {course.isUpcoming ? (
            <button
              onClick={() => { if (!user) window.location.href = "/auth/login"; else alert(`${course.title} is coming soon!`); }}
              style={{
                width: "100%", height: 38, background: "#f97316", color: "#fff",
                border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer",
              }}
            >
              Notify Me
            </button>
          ) : isOwner ? (
            <Link
              href={`/tutor/edit-course/${course.id}`}
              style={{
                display: "block", textAlign: "center", height: 38, lineHeight: "38px",
                border: "1px solid var(--ink)", color: "var(--ink)",
                fontWeight: 800, fontSize: 13,
              }}
            >
              Manage
            </Link>
          ) : (course as any).isEnrolled ? (
            <Link
              href={`/student/learn/${course.id}`}
              style={{
                display: "block", textAlign: "center", height: 38, lineHeight: "38px",
                background: "var(--brand)", color: "#fff",
                fontWeight: 800, fontSize: 13,
              }}
            >
              {course.price === 0 ? "View Course" : "Watch Now"}
            </Link>
          ) : (
            <Link
              href={`/courses/${course.id}`}
              style={{
                display: "block", textAlign: "center", height: 38, lineHeight: "38px",
                background: "var(--ink)", color: "#fff",
                fontWeight: 800, fontSize: 13,
              }}
            >
              Enroll Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );

  return card;
}
