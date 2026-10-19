"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { HoverCard } from "@/components/ui";
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

export default function FeaturedCoursesCarousel() {
  const { user, token, isAuthenticated } = useAuth();
  const [allCourses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState("all");
  const [navigation, setNavigation] = useState({ previous: false, next: false });
  const courseTrackRef = useRef<HTMLDivElement>(null);

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

      return topicMatch;
    });
  };

  const courses = getFilteredCourses();

  const scrollCourses = (direction: "previous" | "next") => {
    const track = courseTrackRef.current;
    if (!track) return;

    track.scrollBy({
      left: (direction === "next" ? 1 : -1) * Math.max(track.clientWidth * 0.8, 300),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    courseTrackRef.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [activeTopic]);

  useEffect(() => {
    const track = courseTrackRef.current;
    if (loading || !track) {
      setNavigation({ previous: false, next: false });
      return;
    }
    const updateNavigation = () => setNavigation({
      previous: track.scrollLeft > 2,
      next: track.scrollLeft + track.clientWidth < track.scrollWidth - 2,
    });
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(track);
    for (const card of Array.from(track.children)) observer.observe(card);
    track.addEventListener("scroll", updateNavigation, { passive: true });
    updateNavigation();
    return () => { observer.disconnect(); track.removeEventListener("scroll", updateNavigation); };
  }, [activeTopic, allCourses, loading]);
  return (
    <section style={{ padding: "34px 0" }}>
      <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
        {/* Section head */}
        <div data-home-reveal style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, marginBottom: 18 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>
              Search like you are planning your semester
            </h2>
            <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
              Browse sessions mapped to Sri Lankan faculties, course codes, and semester needs.
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
          data-home-reveal
          data-home-delay="1"
          role="tablist"
        >
          {TOPICS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTopic(tab.id)}
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

        {/* Course carousel */}
        <div className="course-carousel__area" style={{ marginTop: 20 }}>
          {loading ? (
            <div
              ref={courseTrackRef}
              className="course-carousel"
              style={{
                display: "flex",
                overflowX: "auto",
                gap: 18,
                padding: "8px 4px 18px",
              }}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{ flex: "0 0 clamp(245px, 28vw, 300px)", border: "1px solid #d7ebe5", borderRadius: 18, overflow: "hidden", background: "rgba(255,255,255,.75)" }}
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
              ref={courseTrackRef}
              id="featured-course-track"
              role="region"
              aria-label="Featured courses"
              tabIndex={0}
              className="course-carousel"
              style={{
                display: "flex",
                overflowX: "auto",
                gap: 18,
                padding: "8px 4px 18px",
                scrollSnapType: "x mandatory",
              }}
            >
              {courses.map((course, index) => (
                <div key={course.id} data-home-reveal data-home-delay={String(Math.min(index, 3))} style={{ flex: "0 0 clamp(245px, 28vw, 300px)", scrollSnapAlign: "start" }}>
                  <CourseCard course={course} user={user} />
                </div>
              ))}
            </div>
          )}
          {!loading && (navigation.previous || navigation.next) && (
            <div className="course-carousel__controls" role="group" aria-label="Browse courses">
              <button type="button" onClick={() => scrollCourses("previous")} className="course-carousel__button" disabled={!navigation.previous} aria-label="Show previous courses" aria-controls="featured-course-track">
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollCourses("next")} className="course-carousel__button" disabled={!navigation.next} aria-label="Show more courses" aria-controls="featured-course-track">
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .course-carousel { scrollbar-width: none; -ms-overflow-style: none; }
        .course-carousel::-webkit-scrollbar { display: none; }
        .course-carousel__area { position: relative; }
        .course-carousel__controls { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
        .course-carousel__button {
          display: inline-grid; flex: 0 0 44px; place-items: center; width: 44px; height: 44px;
          border: 1px solid #e4e7ec; border-radius: 50%; background: #fff;
          color: var(--ink); cursor: pointer; box-shadow: 0 4px 14px rgba(15,23,42,.14);
          transition: transform .15s ease, background .15s ease, box-shadow .15s ease;
        }
        .course-carousel__button:hover:not(:disabled) { background: #f4fbf8; box-shadow: 0 7px 18px rgba(15,23,42,.2); }
        .course-carousel__button:disabled { opacity: .4; cursor: default; box-shadow: none; }
        .course-carousel__button:focus-visible { outline: 3px solid #73bbaa; outline-offset: 2px; }
        :global(.course-card-hover:hover) {
          transform: translateY(-7px) rotateX(2deg);
          box-shadow: 0 23px 38px rgba(7,63,56,.2), inset 0 1px 0 rgba(255,255,255,.92) !important;
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

  const href = isOwner
    ? `/tutor/edit-course/${course.id}`
    : (course as any).isEnrolled
      ? `/student/learn/${course.id}`
      : `/courses/${course.id}`;

  // Parse description into bullet lines
  const descLines = (course.description || "")
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 12)
    .slice(0, 3);

  const cardTrigger = (
    <Link href={href} style={{ textDecoration: "none", display: "block" }}>
      <article
        style={{
          position: "relative", minWidth: 0,
          background: "linear-gradient(145deg, rgba(255,255,255,.94), rgba(231,247,242,.72))",
          border: "1px solid rgba(255,255,255,.9)",
          borderRadius: 18, overflow: "hidden",
          backdropFilter: "blur(12px)",
          boxShadow: "0 14px 28px rgba(7,63,56,.12), inset 0 1px 0 rgba(255,255,255,.85)",
          transition: "transform .18s ease, box-shadow .18s ease",
          cursor: "pointer", display: "flex", flexDirection: "column",
        }}
        className="course-card-hover"
        data-home-hover
      >
        <img
          style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", background: "#e6e6e6" }}
          src={course.thumbnail || "/library-study-group.png"}
          alt={course.title}
          onError={(e) => { (e.target as HTMLImageElement).src = "/library-study-group.png"; }}
        />
        <div style={{ padding: 12, flex: 1, display: "flex", flexDirection: "column" }}>
          <h4 style={{ minHeight: 44, margin: "0 0 6px", fontSize: 15, lineHeight: 1.25, fontWeight: 800, color: "var(--ink)" }}>
            {course.title}
          </h4>
          <div style={{ color: "var(--muted)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            By {tutorName}
          </div>
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
          {course.rating && Number(course.rating) > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "8px 0", color: "var(--gold)", fontSize: 14, fontWeight: 800 }}>
              {Number(course.rating).toFixed(1)} ★
              <span style={{ color: "var(--muted)", fontWeight: 400 }}>({(course.enrollmentCount || 0).toLocaleString()})</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: "auto", paddingTop: 8, fontWeight: 800, fontSize: 14 }}>
            <span>{priceLabel}</span>
            <span style={{ display: "inline-flex", alignItems: "center", height: 25, padding: "0 8px", background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 12, fontWeight: 800 }}>
              {badge}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );

  const popup = (
    <div style={{ padding: 18 }}>
      {/* Badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {course.level && (
          <span style={{ padding: "3px 8px", background: "#dbeafe", color: "#1e40af", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
            {course.level}
          </span>
        )}
        {facultyLabel && (
          <span style={{ padding: "3px 8px", background: "#e8f6f1", color: "var(--brand-dark)", fontSize: 11, fontWeight: 700, borderRadius: 3 }}>
            {facultyLabel}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 800, lineHeight: 1.3, color: "#111" }}>
        {course.title}
      </h4>
      <p style={{ margin: "0 0 10px", fontSize: 12, color: "#64748b" }}>
        By {tutorName}{course.year ? ` · Year ${course.year}` : ""}
      </p>

      {/* Rating */}
      {course.rating && Number(course.rating) > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10, fontSize: 13 }}>
          <span style={{ color: "#f59e0b", fontWeight: 800 }}>{"★".repeat(Math.round(Number(course.rating)))}</span>
          <span style={{ fontWeight: 700 }}>{Number(course.rating).toFixed(1)}</span>
          {course.enrollmentCount ? (
            <span style={{ color: "#94a3b8", fontSize: 12 }}>({course.enrollmentCount.toLocaleString()} students)</span>
          ) : null}
        </div>
      )}

      {/* Description bullets */}
      {descLines.length > 0 && (
        <ul style={{ margin: "0 0 14px", padding: 0, listStyle: "none" }}>
          {descLines.map((line, i) => (
            <li key={i} style={{ display: "flex", gap: 7, fontSize: 12.5, color: "#374151", marginBottom: 5 }}>
              <span style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }}>✓</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Price + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#111" }}>{priceLabel}</span>
        {(course as any).originalPrice && (
          <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "line-through" }}>
            LKR {Number((course as any).originalPrice).toLocaleString()}
          </span>
        )}
      </div>

      <Link
        href={href}
        style={{
          display: "block", width: "100%", textAlign: "center",
          padding: "11px 0",
          background: "var(--brand)", color: "#fff",
          fontWeight: 800, fontSize: 14, borderRadius: 5,
          textDecoration: "none", transition: "background .15s",
        }}
      >
        {(course as any).isEnrolled ? "Continue Learning" : priceLabel === "FREE" ? "Enrol Free" : "View Course"}
      </Link>
    </div>
  );

  return <HoverCard trigger={cardTrigger} popup={popup} />;
}
