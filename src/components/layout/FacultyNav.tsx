"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { facultyService, type Faculty } from "@/services/faculty.service";

// Sri Lankan university faculties + departments used as fallback when backend is empty
const FALLBACK_FACULTIES: Faculty[] = [
  {
    id: 1, name: "Computing & IT", slug: "computing-it", isActive: true, order: 1,
    departments: [
      { id: 1, name: "Computer Science", slug: "computer-science", facultyId: 1, isActive: true, order: 1 },
      { id: 2, name: "Software Engineering", slug: "software-engineering", facultyId: 1, isActive: true, order: 2 },
      { id: 3, name: "Information Systems", slug: "information-systems", facultyId: 1, isActive: true, order: 3 },
      { id: 4, name: "Data Science & AI", slug: "data-science-ai", facultyId: 1, isActive: true, order: 4 },
      { id: 5, name: "Cybersecurity", slug: "cybersecurity", facultyId: 1, isActive: true, order: 5 },
      { id: 6, name: "Computer Engineering", slug: "computer-engineering", facultyId: 1, isActive: true, order: 6 },
    ],
  },
  {
    id: 2, name: "Engineering", slug: "engineering", isActive: true, order: 2,
    departments: [
      { id: 7, name: "Civil Engineering", slug: "civil-engineering", facultyId: 2, isActive: true, order: 1 },
      { id: 8, name: "Mechanical Engineering", slug: "mechanical-engineering", facultyId: 2, isActive: true, order: 2 },
      { id: 9, name: "Electrical & Electronic", slug: "electrical-electronic", facultyId: 2, isActive: true, order: 3 },
      { id: 10, name: "Chemical & Process", slug: "chemical-process", facultyId: 2, isActive: true, order: 4 },
      { id: 11, name: "Production Engineering", slug: "production-engineering", facultyId: 2, isActive: true, order: 5 },
      { id: 12, name: "Electronics & Telecom", slug: "electronics-telecom", facultyId: 2, isActive: true, order: 6 },
    ],
  },
  {
    id: 3, name: "Medicine & Health", slug: "medicine-health", isActive: true, order: 3,
    departments: [
      { id: 13, name: "Anatomy", slug: "anatomy", facultyId: 3, isActive: true, order: 1 },
      { id: 14, name: "Physiology", slug: "physiology", facultyId: 3, isActive: true, order: 2 },
      { id: 15, name: "Pharmacology", slug: "pharmacology", facultyId: 3, isActive: true, order: 3 },
      { id: 16, name: "Community Medicine", slug: "community-medicine", facultyId: 3, isActive: true, order: 4 },
      { id: 17, name: "Surgery", slug: "surgery", facultyId: 3, isActive: true, order: 5 },
      { id: 18, name: "Internal Medicine", slug: "internal-medicine", facultyId: 3, isActive: true, order: 6 },
      { id: 19, name: "Nursing", slug: "nursing", facultyId: 3, isActive: true, order: 7 },
    ],
  },
  {
    id: 4, name: "Management & Business", slug: "management-business", isActive: true, order: 4,
    departments: [
      { id: 20, name: "Business Administration", slug: "business-administration", facultyId: 4, isActive: true, order: 1 },
      { id: 21, name: "Accountancy", slug: "accountancy", facultyId: 4, isActive: true, order: 2 },
      { id: 22, name: "Finance", slug: "finance", facultyId: 4, isActive: true, order: 3 },
      { id: 23, name: "Marketing", slug: "marketing", facultyId: 4, isActive: true, order: 4 },
      { id: 24, name: "Human Resource Mgt", slug: "hrm", facultyId: 4, isActive: true, order: 5 },
      { id: 25, name: "Economics", slug: "economics", facultyId: 4, isActive: true, order: 6 },
      { id: 26, name: "Entrepreneurship", slug: "entrepreneurship", facultyId: 4, isActive: true, order: 7 },
    ],
  },
  {
    id: 5, name: "Arts & Humanities", slug: "arts-humanities", isActive: true, order: 5,
    departments: [
      { id: 27, name: "English", slug: "english", facultyId: 5, isActive: true, order: 1 },
      { id: 28, name: "Sinhala", slug: "sinhala", facultyId: 5, isActive: true, order: 2 },
      { id: 29, name: "Tamil", slug: "tamil", facultyId: 5, isActive: true, order: 3 },
      { id: 30, name: "History", slug: "history", facultyId: 5, isActive: true, order: 4 },
      { id: 31, name: "Political Science", slug: "political-science", facultyId: 5, isActive: true, order: 5 },
      { id: 32, name: "Sociology", slug: "sociology", facultyId: 5, isActive: true, order: 6 },
      { id: 33, name: "Psychology", slug: "psychology", facultyId: 5, isActive: true, order: 7 },
      { id: 34, name: "Mass Communication", slug: "mass-communication", facultyId: 5, isActive: true, order: 8 },
    ],
  },
  {
    id: 6, name: "Science", slug: "science", isActive: true, order: 6,
    departments: [
      { id: 35, name: "Mathematics", slug: "mathematics", facultyId: 6, isActive: true, order: 1 },
      { id: 36, name: "Statistics", slug: "statistics", facultyId: 6, isActive: true, order: 2 },
      { id: 37, name: "Physics", slug: "physics", facultyId: 6, isActive: true, order: 3 },
      { id: 38, name: "Chemistry", slug: "chemistry", facultyId: 6, isActive: true, order: 4 },
      { id: 39, name: "Botany", slug: "botany", facultyId: 6, isActive: true, order: 5 },
      { id: 40, name: "Zoology", slug: "zoology", facultyId: 6, isActive: true, order: 6 },
      { id: 41, name: "Microbiology", slug: "microbiology", facultyId: 6, isActive: true, order: 7 },
      { id: 42, name: "Environmental Science", slug: "environmental-science", facultyId: 6, isActive: true, order: 8 },
    ],
  },
  {
    id: 7, name: "Law", slug: "law", isActive: true, order: 7,
    departments: [
      { id: 43, name: "Private Law", slug: "private-law", facultyId: 7, isActive: true, order: 1 },
      { id: 44, name: "Public & International Law", slug: "public-international-law", facultyId: 7, isActive: true, order: 2 },
      { id: 45, name: "Commercial Law", slug: "commercial-law", facultyId: 7, isActive: true, order: 3 },
    ],
  },
  {
    id: 8, name: "Education", slug: "education", isActive: true, order: 8,
    departments: [
      { id: 46, name: "Science Education", slug: "science-education", facultyId: 8, isActive: true, order: 1 },
      { id: 47, name: "Language Education", slug: "language-education", facultyId: 8, isActive: true, order: 2 },
      { id: 48, name: "Educational Technology", slug: "educational-technology", facultyId: 8, isActive: true, order: 3 },
      { id: 49, name: "Physical Education", slug: "physical-education", facultyId: 8, isActive: true, order: 4 },
    ],
  },
  {
    id: 9, name: "Agriculture", slug: "agriculture", isActive: true, order: 9,
    departments: [
      { id: 50, name: "Agronomy", slug: "agronomy", facultyId: 9, isActive: true, order: 1 },
      { id: 51, name: "Animal Science", slug: "animal-science", facultyId: 9, isActive: true, order: 2 },
      { id: 52, name: "Agricultural Engineering", slug: "agricultural-engineering", facultyId: 9, isActive: true, order: 3 },
      { id: 53, name: "Food Science", slug: "food-science", facultyId: 9, isActive: true, order: 4 },
      { id: 54, name: "Horticulture", slug: "horticulture", facultyId: 9, isActive: true, order: 5 },
    ],
  },
  {
    id: 10, name: "Architecture", slug: "architecture", isActive: true, order: 10,
    departments: [
      { id: 55, name: "Architecture", slug: "architecture-dept", facultyId: 10, isActive: true, order: 1 },
      { id: 56, name: "Town & Country Planning", slug: "town-planning", facultyId: 10, isActive: true, order: 2 },
    ],
  },
  {
    id: 11, name: "Allied Health Sciences", slug: "allied-health", isActive: true, order: 11,
    departments: [
      { id: 57, name: "Medical Laboratory Science", slug: "medical-lab", facultyId: 11, isActive: true, order: 1 },
      { id: 58, name: "Physiotherapy", slug: "physiotherapy", facultyId: 11, isActive: true, order: 2 },
      { id: 59, name: "Radiography", slug: "radiography", facultyId: 11, isActive: true, order: 3 },
      { id: 60, name: "Pharmacy", slug: "pharmacy", facultyId: 11, isActive: true, order: 4 },
    ],
  },
  {
    id: 12, name: "Indigenous Medicine", slug: "indigenous-medicine", isActive: true, order: 12,
    departments: [
      { id: 61, name: "Ayurveda", slug: "ayurveda", facultyId: 12, isActive: true, order: 1 },
      { id: 62, name: "Unani Medicine", slug: "unani", facultyId: 12, isActive: true, order: 2 },
    ],
  },
  {
    id: 13, name: "Dental Sciences", slug: "dental", isActive: true, order: 13,
    departments: [
      { id: 63, name: "Oral Biology", slug: "oral-biology", facultyId: 13, isActive: true, order: 1 },
      { id: 64, name: "Restorative Dentistry", slug: "restorative-dentistry", facultyId: 13, isActive: true, order: 2 },
      { id: 65, name: "Oral Medicine", slug: "oral-medicine", facultyId: 13, isActive: true, order: 3 },
    ],
  },
  {
    id: 14, name: "A/L & Foundation", slug: "al-foundation", isActive: true, order: 14,
    departments: [
      { id: 66, name: "Physical Science", slug: "physical-science", facultyId: 14, isActive: true, order: 1 },
      { id: 67, name: "Biological Science", slug: "biological-science", facultyId: 14, isActive: true, order: 2 },
      { id: 68, name: "Commerce", slug: "commerce", facultyId: 14, isActive: true, order: 3 },
      { id: 69, name: "Arts Stream", slug: "arts-stream", facultyId: 14, isActive: true, order: 4 },
    ],
  },
];

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
