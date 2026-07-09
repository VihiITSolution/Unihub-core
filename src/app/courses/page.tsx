"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Course } from "@/types";
import { API_BASE_URL, BACKEND_URL } from "@/lib/constants";
import facultyService, { FALLBACK_FACULTIES, type Faculty } from "@/services/faculty.service";

const YEARS = [
  { id: "all", label: "All Years" },
  { id: "1",   label: "1st Year" },
  { id: "2",   label: "2nd Year" },
  { id: "3",   label: "3rd Year" },
  { id: "4",   label: "4th Year" },
];

// ── Filter button ─────────────────────────────────────────────────────────────
function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "block", width: "100%", textAlign: "left",
        padding: "8px 10px", border: "none", cursor: "pointer", borderRadius: 5,
        background: active ? "#e8f6f1" : "transparent",
        color: active ? "var(--brand-dark)" : "var(--ink)",
        fontWeight: active ? 800 : 400, fontSize: 13,
        transition: "background .12s",
      }}
    >
      {children}
    </button>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function FilterSection({ title }: { title: string }) {
  return (
    <h4 style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--muted)" }}>
      {title}
    </h4>
  );
}

// ── Inner page (uses useSearchParams — must be inside Suspense) ───────────────
function CoursesInner() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Load all faculties WITH departments once
  const [faculties, setFaculties] = useState<Faculty[]>(FALLBACK_FACULTIES);

  // Filter state — initialise from URL params
  const [selectedFaculty, setSelectedFaculty] = useState(searchParams?.get("facultyId") || "all");
  const [selectedDept,    setSelectedDept]    = useState(searchParams?.get("departmentId") || "all");
  const [selectedYear,    setSelectedYear]    = useState(searchParams?.get("year") || "all");
  const [searchQuery,     setSearchQuery]     = useState(searchParams?.get("search") || "");

  // Courses + UI state
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  // Departments derived from selected faculty (no extra fetch)
  const activeFaculty = faculties.find((f) => String(f.id) === selectedFaculty);
  const depts = activeFaculty?.departments?.filter((d) => d.isActive) ?? [];

  // Load faculties from backend; keep FALLBACK if backend returns nothing
  useEffect(() => {
    facultyService.getAll(true).then((data) => {
      if (data.length > 0) setFaculties(data);
    });
  }, []);

  // When faculty changes, reset department
  const handleFacultyChange = (fId: string) => {
    setSelectedFaculty(fId);
    setSelectedDept("all");
  };

  // Fetch courses whenever filters change
  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedFaculty !== "all") params.set("facultyId",    selectedFaculty);
      if (selectedDept    !== "all") params.set("departmentId", selectedDept);
      if (selectedYear    !== "all") params.set("year",         selectedYear);
      if (searchQuery.trim())        params.set("search",       searchQuery.trim());

      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const qs = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`${API_BASE_URL}/courses${qs}`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCourses(Array.isArray(json.data) ? json.data : json.data.courses ?? []);
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
  }, [selectedFaculty, selectedDept, selectedYear, searchQuery, token]);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const clearFilters = () => {
    setSelectedFaculty("all");
    setSelectedDept("all");
    setSelectedYear("all");
    setSearchQuery("");
  };

  const hasFilters = selectedFaculty !== "all" || selectedDept !== "all" || selectedYear !== "all" || searchQuery.trim();

  // Active filter labels for breadcrumb
  const facultyName = activeFaculty?.name;
  const deptName    = depts.find((d) => String(d.id) === selectedDept)?.name;
  const yearLabel   = YEARS.find((y) => y.id === selectedYear)?.label;

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero */}
      <section style={{ background: "linear-gradient(90deg, rgba(7,63,56,.95), rgba(7,63,56,.80))", color: "#fff" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "44px 0" }}>
          <p style={{ margin: "0 0 8px", color: "#a9f0df", fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            UniHub Kuppi Sessions
          </p>
          <h1 style={{ margin: "0 0 10px", fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.05, fontWeight: 800 }}>
            {facultyName ? `${facultyName} Kuppi` : "Explore All Kuppi Sessions"}
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "#d7f4ec", maxWidth: 560, lineHeight: 1.5 }}>
            Peer-led sessions for every faculty, module, assignment, and exam topic.
          </p>
        </div>
      </section>

      {/* Search bar */}
      <div style={{ background: "var(--soft)", borderBottom: "1px solid var(--line)", padding: "12px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", display: "flex", gap: 10 }}>
          <div style={{
            flex: 1, display: "flex", alignItems: "center", gap: 10,
            height: 44, padding: "0 16px",
            border: "1.5px solid var(--ink)", borderRadius: 999, background: "var(--white)",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--muted)", flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              placeholder="Search code, module, lecturer, topic…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 0, outline: 0, background: "transparent", color: "var(--ink)", fontSize: 14 }}
            />
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{ height: 44, padding: "0 16px", border: "1px solid var(--line)", background: "var(--white)", color: "var(--muted)", fontSize: 13, cursor: "pointer", borderRadius: 6, whiteSpace: "nowrap" }}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active filter breadcrumb */}
      {hasFilters && (
        <div style={{ background: "#f0fdf9", borderBottom: "1px solid #c9f0e4", padding: "8px 0" }}>
          <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>Filtering:</span>
            {facultyName && (
              <span style={{ fontSize: 12, padding: "3px 10px", background: "var(--brand)", color: "#fff", borderRadius: 999, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                {facultyName}
                <button onClick={() => handleFacultyChange("all")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1, opacity: .8 }}>×</button>
              </span>
            )}
            {deptName && (
              <span style={{ fontSize: 12, padding: "3px 10px", background: "var(--brand-dark)", color: "#fff", borderRadius: 999, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                {deptName}
                <button onClick={() => setSelectedDept("all")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1, opacity: .8 }}>×</button>
              </span>
            )}
            {yearLabel && yearLabel !== "All Years" && (
              <span style={{ fontSize: 12, padding: "3px 10px", background: "#64748b", color: "#fff", borderRadius: 999, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                {yearLabel}
                <button onClick={() => setSelectedYear("all")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1, opacity: .8 }}>×</button>
              </span>
            )}
            {searchQuery.trim() && (
              <span style={{ fontSize: 12, padding: "3px 10px", background: "#64748b", color: "#fff", borderRadius: 999, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery("")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", padding: 0, fontSize: 14, lineHeight: 1, opacity: .8 }}>×</button>
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "24px 0" }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }} className="courses-layout">

          {/* ── Sidebar filters ── */}
          <aside style={{ width: 220, flexShrink: 0, position: "sticky", top: 112 }} className="courses-sidebar">

            {/* Faculty */}
            <div style={{ marginBottom: 20 }}>
              <FilterSection title="Faculty" />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FilterBtn active={selectedFaculty === "all"} onClick={() => handleFacultyChange("all")}>
                  All Faculties
                </FilterBtn>
                {faculties.filter((f) => f.isActive).map((f) => (
                  <FilterBtn
                    key={f.id}
                    active={selectedFaculty === String(f.id)}
                    onClick={() => handleFacultyChange(String(f.id))}
                  >
                    {f.name}
                  </FilterBtn>
                ))}
              </div>
            </div>

            {/* Department — appears when faculty selected */}
            {depts.length > 0 && (
              <div style={{ marginBottom: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
                <FilterSection title="Department" />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FilterBtn active={selectedDept === "all"} onClick={() => setSelectedDept("all")}>
                    All Departments
                  </FilterBtn>
                  {depts.map((d) => (
                    <FilterBtn
                      key={d.id}
                      active={selectedDept === String(d.id)}
                      onClick={() => setSelectedDept(String(d.id))}
                    >
                      {d.name}
                    </FilterBtn>
                  ))}
                </div>
              </div>
            )}

            {/* Year */}
            <div style={{ marginBottom: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <FilterSection title="Year" />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {YEARS.map((y) => (
                  <FilterBtn key={y.id} active={selectedYear === y.id} onClick={() => setSelectedYear(y.id)}>
                    {y.label}
                  </FilterBtn>
                ))}
              </div>
            </div>

          </aside>

          {/* ── Course grid ── */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: 14 }}>
                {loading ? "Loading…" : (
                  <>Showing <strong style={{ color: "var(--ink)" }}>{courses.length}</strong> kuppi session{courses.length !== 1 ? "s" : ""}</>
                )}
              </p>
            </div>

            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="course-result-grid">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                    <div className="skeleton" style={{ width: "100%", aspectRatio: "16/9" }} />
                    <div style={{ padding: 14 }}>
                      <div className="skeleton" style={{ height: 16, marginBottom: 8 }} />
                      <div className="skeleton" style={{ height: 12, width: "60%", marginBottom: 10 }} />
                      <div className="skeleton" style={{ height: 14, width: "40%" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div style={{ padding: 24, border: "1px solid #fca5a5", borderRadius: 8, background: "#fef2f2", color: "#991b1b", textAlign: "center" }}>
                <p style={{ margin: "0 0 12px" }}>⚠️ {error}</p>
                <button onClick={loadCourses} style={{ padding: "8px 16px", background: "var(--ink)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 800, borderRadius: 5 }}>
                  Try Again
                </button>
              </div>
            ) : courses.length === 0 ? (
              <div style={{ padding: 48, border: "1px dashed var(--line)", borderRadius: 8, background: "var(--soft)", textAlign: "center" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📚</div>
                <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>No kuppi sessions found</h3>
                <p style={{ margin: "0 0 20px", color: "var(--muted)", fontSize: 14 }}>
                  {hasFilters ? "Try adjusting your filters." : "No sessions available yet."}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} style={{ padding: "9px 20px", background: "var(--ink)", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }} className="course-result-grid">
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
          .courses-sidebar { width: 100% !important; position: static !important; }
          .course-result-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .course-result-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── Course card ───────────────────────────────────────────────────────────────
function CourseCard({ course, user }: { course: Course; user: any }) {
  const tutorName  = course.tutor ? `${course.tutor.firstName} ${course.tutor.lastName}` : (course as any).tutorName || "Instructor";
  const thumbnail  = course.thumbnail
    ? course.thumbnail.startsWith("http") ? course.thumbnail : `${BACKEND_URL}${course.thumbnail}`
    : "/library-study-group.png";
  const priceLabel = course.price === 0 || parseFloat(String(course.price)) === 0
    ? "FREE"
    : `Rs. ${Number(course.price).toLocaleString()}`;
  const facultyLabel = course.faculty?.name || course.categoryObj?.name || (course as any).category || "";
  const isOwner      = user && course.tutorId === user.id;

  return (
    <article
      style={{
        background: "var(--white)", border: "1px solid var(--line)",
        borderRadius: 8, overflow: "hidden",
        transition: "transform .18s, box-shadow .18s", cursor: "pointer",
        display: "flex", flexDirection: "column",
      }}
      className="course-card-hover"
    >
      {/* Thumbnail */}
      <div style={{ position: "relative" }}>
        <img
          src={thumbnail} alt={course.title}
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }}
          onError={(e) => { (e.target as HTMLImageElement).src = "/library-study-group.png"; }}
        />
        {course.isUpcoming && (
          <span style={{ position: "absolute", top: 8, left: 8, background: "#f97316", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 8px", borderRadius: 3 }}>
            UPCOMING
          </span>
        )}
        {course.rating && Number(course.rating) > 0 && (
          <span style={{ position: "absolute", top: 8, right: 8, background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 800, padding: "3px 6px", borderRadius: 3 }}>
            ⭐ {Number(course.rating).toFixed(1)}
          </span>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
        {facultyLabel && (
          <div style={{ marginBottom: 6 }}>
            <span style={{ background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 3 }}>
              {facultyLabel}
            </span>
          </div>
        )}
        <h3 style={{ margin: "0 0 5px", fontSize: 15, lineHeight: 1.3, fontWeight: 800, color: "var(--ink)" }}>
          {course.title}
        </h3>
        <p style={{ margin: "0 0 8px", color: "var(--muted)", fontSize: 12 }}>By {tutorName}</p>

        {course.year && (
          <div style={{ marginBottom: 8 }}>
            <span style={{ background: "var(--soft)", border: "1px solid #ececec", padding: "2px 6px", fontSize: 11, color: "var(--muted)", borderRadius: 3 }}>
              Year {course.year}
            </span>
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid var(--line)", marginTop: "auto" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{priceLabel}</span>
          <span style={{ fontSize: 11, color: "var(--muted)" }}>{(course.enrollmentCount || 0).toLocaleString()} enrolled</span>
        </div>

        <div style={{ marginTop: 10 }}>
          {course.isUpcoming ? (
            <button
              onClick={() => { if (!user) window.location.href = "/auth/login"; else alert(`${course.title} is coming soon!`); }}
              style={{ width: "100%", height: 36, background: "#f97316", color: "#fff", border: "none", fontWeight: 800, fontSize: 13, cursor: "pointer", borderRadius: 5 }}
            >
              Notify Me
            </button>
          ) : isOwner ? (
            <Link href={`/tutor/edit-course/${course.id}`} style={{ display: "block", textAlign: "center", height: 36, lineHeight: "36px", border: "1px solid var(--ink)", color: "var(--ink)", fontWeight: 800, fontSize: 13, textDecoration: "none", borderRadius: 5 }}>
              Manage
            </Link>
          ) : (course as any).isEnrolled ? (
            <Link href={`/student/learn/${course.id}`} style={{ display: "block", textAlign: "center", height: 36, lineHeight: "36px", background: "var(--brand)", color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none", borderRadius: 5 }}>
              {course.price === 0 ? "View Course" : "Watch Now"}
            </Link>
          ) : (
            <Link href={`/courses/${course.id}`} style={{ display: "block", textAlign: "center", height: 36, lineHeight: "36px", background: "var(--ink)", color: "#fff", fontWeight: 800, fontSize: 13, textDecoration: "none", borderRadius: 5 }}>
              Enroll Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

// ── Default export wrapped in Suspense for useSearchParams ────────────────────
export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesInner />
    </Suspense>
  );
}
