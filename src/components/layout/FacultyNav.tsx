"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { facultyService, FALLBACK_FACULTIES, type Faculty } from "@/services/faculty.service";

// ── Dept dropdown rendered via portal so it escapes the overflow-x container ──
function DeptDropdown({
  faculty,
  anchorRef,
  onHide,
}: {
  faculty: Faculty;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  onHide: () => void;
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const depts = (faculty.departments ?? []).filter((d) => d.isActive);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 2, left: rect.left });
  }, [anchorRef]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      onMouseEnter={() => {/* stay open while inside */}}
      onMouseLeave={onHide}
      style={{
        position: "fixed",
        top: pos.top,
        left: pos.left,
        minWidth: 220,
        maxWidth: 280,
        background: "#fff",
        border: "1px solid var(--line)",
        borderRadius: 8,
        boxShadow: "0 12px 36px rgba(0,0,0,.14)",
        zIndex: 9999,
        padding: "6px 0",
        overflowY: "auto",
        maxHeight: 360,
      }}
    >
      <div style={{
        padding: "6px 14px 4px",
        fontSize: 11, fontWeight: 800, color: "var(--muted)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        Departments
      </div>
      {depts.map((dept) => (
        <Link
          key={dept.id}
          href={`/courses?facultyId=${faculty.id}&departmentId=${dept.id}`}
          onClick={onHide}
          style={{
            display: "block",
            padding: "9px 14px",
            fontSize: 13, fontWeight: 500,
            color: "var(--ink)", textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--soft)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {dept.name}
        </Link>
      ))}
    </div>,
    document.body,
  );
}

// ── Single faculty tab ────────────────────────────────────────────────────────
function FacultyItem({ faculty }: { faculty: Faculty }) {
  const [open, setOpen] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const itemRef = useRef<HTMLDivElement>(null);
  const depts = (faculty.departments ?? []).filter((d) => d.isActive);

  const show = useCallback(() => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), 140);
  }, []);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 180);
  }, []);

  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  return (
    <div
      ref={itemRef}
      style={{ position: "relative", flexShrink: 0 }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <Link
        href={`/courses?facultyId=${faculty.id}`}
        style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          height: 40, padding: "0 13px",
          fontSize: 13, fontWeight: 500,
          color: "var(--ink)", textDecoration: "none",
          borderBottom: "2px solid transparent",
          transition: "color .15s, border-color .15s",
          whiteSpace: "nowrap",
        }}
        className="hover-faculty-link"
      >
        {faculty.name}
        {depts.length > 0 && (
          <svg
            width="9" height="9" viewBox="0 0 20 20" fill="currentColor"
            style={{ opacity: 0.45, marginTop: 1, transition: "transform .15s", transform: open ? "rotate(180deg)" : "rotate(0)" }}
          >
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
          </svg>
        )}
      </Link>

      {open && depts.length > 0 && (
        <DeptDropdown faculty={faculty} anchorRef={itemRef} onHide={hide} />
      )}
    </div>
  );
}

// ── Faculty nav bar ───────────────────────────────────────────────────────────
export default function FacultyNav() {
  const [faculties, setFaculties] = useState<Faculty[]>(FALLBACK_FACULTIES);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    facultyService.getAll(true).then((data) => {
      // Use backend data if any faculty has departments; otherwise keep FALLBACK
      // so the nav always shows department dropdowns even before departments are seeded
      const hasDepts = data.some((f) => (f.departments ?? []).length > 0);
      if (hasDepts) setFaculties(data);
      // else: FALLBACK_FACULTIES (set as initial state) remains in use
    });
  }, []);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" });
  };

  const arrowStyle = (visible: boolean): React.CSSProperties => ({
    position: "absolute", top: 0, bottom: 0, zIndex: 10,
    width: 32, display: visible ? "flex" : "none",
    alignItems: "center", justifyContent: "center",
    background: "linear-gradient(to right, #fff 60%, transparent)",
    border: "none", cursor: "pointer", padding: 0,
    color: "var(--ink)",
  });

  return (
    <div
      style={{ borderTop: "1px solid var(--line)", position: "relative" }}
    >
      {/* Left fade + arrow */}
      <button
        onClick={() => scroll("left")}
        aria-label="Scroll left"
        style={{ ...arrowStyle(canScrollLeft), left: 0, background: "linear-gradient(to right, #fff 60%, transparent)" }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd"/>
        </svg>
      </button>

      {/* Scrollable track — overflow-x here, NOT on the outer wrapper */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 36px",          /* room for arrows */
          overflowX: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          /* no overflow-y clip here — dropdowns use portal so they're not affected */
        }}
      >
        {faculties.filter((f) => f.isActive).map((f) => (
          <FacultyItem key={f.id} faculty={f} />
        ))}
      </div>

      {/* Right fade + arrow */}
      <button
        onClick={() => scroll("right")}
        aria-label="Scroll right"
        style={{ ...arrowStyle(canScrollRight), right: 0, background: "linear-gradient(to left, #fff 60%, transparent)" }}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );
}
