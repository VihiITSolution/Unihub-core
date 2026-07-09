"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { facultyService, FALLBACK_FACULTIES, type Faculty } from "@/services/faculty.service";

function FacultyItem({ faculty }: { faculty: Faculty }) {
  const [open, setOpen] = useState(false);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const itemRef = useRef<HTMLDivElement>(null);
  const depts = faculty.departments ?? [];

  const show = () => {
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => setOpen(true), 160);
  };
  const hide = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => () => { clearTimeout(showTimer.current); clearTimeout(hideTimer.current); }, []);

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
          display: "inline-flex", alignItems: "center", gap: 4,
          height: 40, padding: "0 14px",
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
          <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.4, marginTop: 1 }}>
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/>
          </svg>
        )}
      </Link>

      {/* Department dropdown */}
      {open && depts.length > 0 && (
        <div
          onMouseEnter={show}
          onMouseLeave={hide}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            minWidth: 220,
            background: "#fff",
            border: "1px solid var(--line)",
            borderRadius: 8,
            boxShadow: "0 8px 30px rgba(0,0,0,.12)",
            zIndex: 100,
            padding: "6px 0",
            overflowY: "auto",
            maxHeight: 320,
          }}
        >
          <div style={{ padding: "6px 14px 4px", fontSize: 11, fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Departments
          </div>
          {depts.map((dept) => (
            <Link
              key={dept.id}
              href={`/courses?facultyId=${faculty.id}&departmentId=${dept.id}`}
              onClick={() => setOpen(false)}
              style={{
                display: "block",
                padding: "8px 14px",
                fontSize: 13, fontWeight: 500,
                color: "var(--ink)", textDecoration: "none",
                transition: "background .12s",
              }}
              className="hover:bg-soft"
            >
              {dept.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FacultyNav() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);

  useEffect(() => {
    facultyService.getAll(true).then((data) => {
      setFaculties(data.length > 0 ? data : FALLBACK_FACULTIES);
    });
  }, []);

  // While loading, show fallback immediately for snappier UX
  const items = faculties.length > 0 ? faculties : FALLBACK_FACULTIES;

  return (
    <div
      className="hidden lg:block"
      style={{
        borderTop: "1px solid var(--line)",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          whiteSpace: "nowrap",
        }}
      >
        {items.map((f) => (
          <FacultyItem key={f.id} faculty={f} />
        ))}
      </div>
    </div>
  );
}
