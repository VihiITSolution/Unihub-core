"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { RoleUpgradeModal } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";
import FeaturedCoursesCarousel from "@/components/FeaturedCoursesCarousel";
import HeroSection from "@/components/HeroSection";
import { statsService } from "@/services/stats.service";

// Fallback shown until the real platform stats load (or if the request fails).
const FALLBACK_STATS = [
  { value: "—", label: "Active Students" },
  { value: "—", label: "Tutors" },
  { value: "—", label: "Sessions" },
  { value: "—", label: "Ratings" },
];

const PROMISE_CARDS = [
  { title: "Catch up fast", body: "Search by module, year, faculty, assignment type, or exam topic when lectures move faster than your notes." },
  { title: "Save money", body: "Buy used calculators, lab coats, laptops, books, drawing boards, and hostel items from other students." },
  { title: "Find a place", body: "Compare boarding, annexes, shared rooms, and hostels near universities before semester starts." },
  { title: "Feel ready", body: "Prepare for presentations, vivas, internships, repeat exams, and final-year research with practical guidance." },
];

const CAMPUS_AREAS = [
  { title: "Module & assignment help", detail: "Find kuppi sessions mapped to your exact course code, lecturer, and semester week." },
  { title: "Peer-led study groups", detail: "Join or host group sessions for lab reports, vivas, final exams, and group projects." },
  { title: "Semester-aware planning", detail: "Sessions are tagged by year, faculty, and deadline season — not just topic." },
  { title: "Flexible & remote-friendly", detail: "Online and on-campus options for all faculties, including evening and part-time students." },
];

const PATHWAYS = [
  { title: "IT undergraduate pathway", desc: "Cover programming, databases, web projects, software engineering assignments, and internship portfolio work.", meta: ["6 modules", "42 hours", "Portfolio ready"] },
  { title: "Management studies pathway", desc: "Prepare for presentations, marketing plans, accounting basics, research methods, and group assignments.", meta: ["5 modules", "31 hours", "Viva practice"] },
  { title: "Engineering support pathway", desc: "Get help with circuit theory, lab reports, design calculations, and exam revision.", meta: ["7 modules", "54 hours", "Lab support"] },
];

const TESTIMONIALS = [
  { quote: '"I searched by my department and found help for the exact assignment week I was stuck in."', author: "Hashan M., Computing" },
  { quote: '"The viva practice made our final presentation feel much less scary."', author: "Nimali S., Management" },
  { quote: '"It felt like a study group that understood Sri Lankan university pressure."', author: "Yohan P., Engineering" },
];

const TRUST_LABELS = ["Public Universities", "Private Institutes", "External Degrees", "A/L Leavers", "Student Clubs", "Internship Prep"];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [stats, setStats] = useState(FALLBACK_STATS);

  useEffect(() => {
    statsService
      .getPlatformStats()
      .then((response) => {
        if (response.success && response.data) {
          const d = response.data;
          setStats([
            { value: `${d.activeStudents}+`, label: "Active Students" },
            { value: `${d.tutors}+`, label: "Tutors" },
            { value: `${d.sessions}+`, label: "Sessions" },
            { value: d.averageRating ? `${d.averageRating}★` : "New", label: "Ratings" },
          ]);
        }
      })
      .catch((err) => console.error("Failed to load platform stats:", err));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero */}
      <HeroSection />

      {/* Stats band */}
      <section style={{ borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", background: "#f2fbf8" }}>
        <div
          style={{
            width: "min(1180px, calc(100% - 40px))",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            padding: "28px 0",
            textAlign: "center",
          }}
          className="stats-grid-responsive"
        >
          {stats.map((s) => (
            <div key={s.label}>
              <strong style={{ display: "block", fontSize: 28, fontWeight: 800, color: "var(--ink)" }}>{s.value}</strong>
              <span style={{ color: "var(--muted)" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Featured courses / kuppi sessions */}
      <FeaturedCoursesCarousel />

      {/* Promise grid — what UniHub is */}
      <section style={{ background: "var(--soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "34px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, marginBottom: 18 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>
                Built for the week before everything is due
              </h2>
              <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
                UniHub is not just a kuppi list. It is a student survival space for learning, earning, moving rooms, finding deals, and getting ready for the next semester.
              </p>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}
            className="promise-grid-responsive"
          >
            {PROMISE_CARDS.map((card) => (
              <article
                key={card.title}
                style={{ padding: 18, border: "1px solid var(--line)", borderRadius: 6, background: "var(--white)" }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>{card.title}</h3>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Campus spotlight */}
      <section style={{ background: "#fff8ec", borderTop: "1px solid #f0dfc4", borderBottom: "1px solid #f0dfc4" }}>
        <div
          style={{
            width: "min(1180px, calc(100% - 40px))",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1.05fr",
            gap: 24,
            alignItems: "center",
            padding: "34px 0",
          }}
          className="campus-layout-responsive"
        >
          <div>
            <h2 style={{ margin: "0 0 14px", fontSize: 30, fontWeight: 800 }}>
              Built around Sri Lankan campus life
            </h2>
            <p style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>
              From A/L transition to final-year research, UniHub organises kuppi sessions around the rhythm students already know: semester weeks, group projects, lab reports, vivas, hostel study nights, and internship season.
            </p>
            <div
              style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}
              className="campus-areas-grid"
            >
              {CAMPUS_AREAS.map((area) => (
                <div
                  key={area.title}
                  style={{ padding: 14, background: "var(--white)", border: "1px solid #ead9bd", borderRadius: 6, fontWeight: 800 }}
                >
                  {area.title}
                  <span style={{ display: "block", marginTop: 5, color: "var(--muted)", fontSize: 13, fontWeight: 400, lineHeight: 1.35 }}>
                    {area.detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <img
            style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 6, border: "1px solid #e8d6b7", boxShadow: "var(--shadow)" }}
            src="/campus-walkway.png"
            alt="Sri Lankan university students walking between lectures"
          />
        </div>
      </section>

      {/* Pathways */}
      <section style={{ padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>From semester pass to graduate-ready</h2>
            <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
              Structured pathways combine module support, projects, GPA recovery, and mentor guidance.
            </p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            className="career-grid-responsive"
          >
            {PATHWAYS.map((p) => (
              <article
                key={p.title}
                style={{ minHeight: 192, padding: 20, border: "1px solid var(--line)", borderRadius: 6, background: "var(--white)" }}
              >
                <h3 style={{ margin: "0 0 8px", fontSize: 20, fontWeight: 800 }}>{p.title}</h3>
                <p style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>{p.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, color: "var(--muted)", fontSize: 13 }}>
                  {p.meta.map((m) => <span key={m}>{m}</span>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section style={{ background: "#202124", color: "var(--white)", padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Designed for local study culture</h2>
            <p style={{ margin: "8px 0 0", color: "#cfd2d5", lineHeight: 1.45 }}>
              Support for public university students, private institute students, external degree learners, and A/L leavers entering higher education.
            </p>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginTop: 20 }}
            className="trust-grid-responsive"
          >
            {TRUST_LABELS.map((label) => (
              <div
                key={label}
                style={{
                  display: "grid", placeItems: "center", minHeight: 58,
                  border: "1px solid rgba(255,255,255,.28)",
                  color: "#f3f4f6", fontWeight: 800, fontSize: 13, textAlign: "center",
                  padding: "0 8px",
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "34px 0" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>Student stories that feel familiar</h2>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}
            className="testimonials-responsive"
          >
            {TESTIMONIALS.map((t) => (
              <article
                key={t.author}
                style={{ padding: 20, border: "1px solid var(--line)", borderRadius: 6, background: "var(--white)", lineHeight: 1.45 }}
              >
                {t.quote}
                <strong style={{ display: "block", marginTop: 16, color: "var(--ink)" }}>{t.author}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      {!isAuthenticated && (
        <section style={{ background: "var(--brand-dark)", color: "#fff", padding: "34px 28px", textAlign: "center" }}>
          <h2 style={{ margin: "0 0 12px", fontSize: 30, fontWeight: 800 }}>Ready to ace your university exams?</h2>
          <p style={{ margin: "0 0 24px", fontSize: 18, color: "#d7f4ec", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            Join UniHub today and get access to peer-led kuppi sessions, simplified module guides, and connect with fellow Sri Lankan university students.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/auth/register"
              style={{
                height: 48, display: "inline-flex", alignItems: "center", padding: "0 24px",
                background: "#fff", color: "var(--ink)", fontSize: 14, fontWeight: 800, border: "1px solid #fff",
              }}
            >
              Join Free
            </Link>
            <Link
              href="/courses"
              style={{
                height: 48, display: "inline-flex", alignItems: "center", padding: "0 24px",
                background: "transparent", color: "#fff", fontSize: 14, fontWeight: 800,
                border: "1px solid rgba(255,255,255,.6)",
              }}
            >
              Browse Kuppi Sessions
            </Link>
          </div>
        </section>
      )}

      {/* Role Upgrade Modal */}
      <RoleUpgradeModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        roleType="tutor"
        featureName="Create Kuppi"
      />

      <style jsx>{`
        @media (max-width: 980px) {
          .stats-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .promise-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .campus-layout-responsive { grid-template-columns: 1fr !important; }
          .career-grid-responsive { grid-template-columns: 1fr !important; }
          .trust-grid-responsive { grid-template-columns: repeat(3, 1fr) !important; }
          .testimonials-responsive { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid-responsive { grid-template-columns: 1fr !important; }
          .promise-grid-responsive { grid-template-columns: 1fr !important; }
          .trust-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .campus-areas-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
