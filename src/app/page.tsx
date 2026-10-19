"use client";

import { useState } from "react";
import Link from "next/link";
import { RoleUpgradeModal } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";
import FeaturedCoursesCarousel from "@/components/FeaturedCoursesCarousel";
import HeroSection from "@/components/HeroSection";
import CombinedPromotionBanner from "@/components/CombinedPromotionBanner";

const UNIHUB_OVERVIEW = [
  { number: "01", title: "Learn", body: "Find courses, study help, and student groups." },
  { number: "02", title: "Earn & save", body: "Teach, sell student items, and discover deals." },
  { number: "03", title: "Settle in", body: "Explore boarding and campus-life essentials." },
];

const CAMPUS_AREAS = [
  { title: "Course help", detail: "Find support for assignments, labs, and exams." },
  { title: "Study groups", detail: "Join or start a group with other students." },
  { title: "Plan your semester", detail: "Find support by year, faculty, and deadline." },
  { title: "Learn your way", detail: "Choose online or campus sessions that suit you." },
];

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: "var(--white)" }}>
      {/* Hero */}
      <HeroSection />

      {false && !isLoading && !user?.isTutorProfileComplete && (
        <section style={{ background: "linear-gradient(115deg, #053f38 0%, #0b665a 58%, #18786b 100%)", color: "#fff", borderBottom: "1px solid rgba(255,255,255,.18)" }}>
          <div
            style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "28px 0", display: "grid", gridTemplateColumns: "1.2fr repeat(2, minmax(190px, .72fr)) auto", gap: 18, alignItems: "center" }}
            className="tutor-reward-banner"
          >
            <div>
              <span style={{ display: "inline-block", marginBottom: 8, color: "#a9f0df", fontSize: 11, fontWeight: 800, letterSpacing: ".12em" }}>TUTOR VIDEO TUTORIAL PROGRAM</span>
              <h2 style={{ margin: "0 0 7px", fontSize: "clamp(24px, 3vw, 34px)", lineHeight: 1.1, fontWeight: 800 }}>Create tutorials. Earn more.</h2>
              <p style={{ margin: 0, color: "#d7f4ec", fontSize: 14, lineHeight: 1.45 }}>Earn up to LKR 300 per qualifying video and keep 90% of each completed sale after the promotion.</p>
            </div>
            <div style={{ padding: "14px 16px", border: "1px solid rgba(255,255,255,.3)", borderRadius: 8, background: "rgba(255,255,255,.1)" }}>
              <span style={{ display: "block", color: "#a9f0df", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>UNIHUB APPROVED VIDEO</span>
              <strong style={{ display: "block", margin: "5px 0", fontSize: 25 }}>LKR 150</strong>
              <span style={{ fontSize: 12, color: "#e4faf4", lineHeight: 1.35 }}>for each 20+ minute tutorial</span>
            </div>
            <div style={{ padding: "14px 16px", border: "1px solid rgba(255,222,155,.6)", borderRadius: 8, background: "rgba(245,158,11,.18)" }}>
              <span style={{ display: "block", color: "#ffe2a0", fontSize: 10, fontWeight: 800, letterSpacing: ".08em" }}>100+ ENROLMENTS</span>
              <strong style={{ display: "block", margin: "5px 0", fontSize: 25 }}>+ LKR 150</strong>
              <span style={{ fontSize: 12, color: "#fff5dc", lineHeight: 1.35 }}>bonus for the same video</span>
            </div>
            <div style={{ minWidth: 150 }}>
              <Link href={isAuthenticated ? "/student/become-tutor" : "/auth/register"} style={{ display: "inline-flex", minHeight: 46, alignItems: "center", justifyContent: "center", width: "100%", padding: "0 16px", background: "#fff", color: "#08483f", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 800 }}>
                Become a Tutor →
              </Link>
              <p style={{ margin: "9px 0 0", color: "#c7eee5", fontSize: 10, lineHeight: 1.35, textAlign: "center" }}>Set your own price later.</p>
            </div>
          </div>
        </section>
      )}

      {/* Featured courses / kuppi sessions */}
      <FeaturedCoursesCarousel />

      {/* UniHub overview */}
      <section style={{ background: "#f4fbf8", borderTop: "1px solid #d7ebe5", borderBottom: "1px solid #d7ebe5" }}>
        <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", padding: "34px 0" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, marginBottom: 18 }}>
            <div>
              <span style={{ color: "var(--brand-dark)", fontSize: 12, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase" }}>One student hub</span>
              <h2 style={{ margin: "5px 0 0", fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>UniHub makes student life simpler</h2>
              <p style={{ margin: "8px 0 0", color: "var(--muted)", lineHeight: 1.45 }}>
                Learn, earn, and find what you need for campus life in one place.
              </p>
            </div>
          </div>
          <div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}
            className="promise-grid-responsive"
          >
            {UNIHUB_OVERVIEW.map((card) => (
              <article
                key={card.title}
                style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: 20, border: "1px solid #cfe6df", borderRadius: 10, background: "var(--white)" }}
              >
                <span style={{ color: "var(--brand-dark)", fontSize: 13, fontWeight: 800, letterSpacing: ".08em" }}>{card.number}</span>
                <div>
                  <h3 style={{ margin: "0 0 5px", fontSize: 19, fontWeight: 800 }}>{card.title}</h3>
                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.45 }}>{card.body}</p>
                </div>
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
              Made for campus life
            </h2>
            <p style={{ margin: "0 0 18px", color: "var(--muted)", lineHeight: 1.45 }}>
              Find study support, join groups, and plan your semester in one place.
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

      {/* Promotions — placed directly before the site footer. */}
      <CombinedPromotionBanner isAuthenticated={isAuthenticated} isVendor={Array.isArray(user?.roles) && user.roles.includes("vendor")} />

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
          .tutor-reward-banner { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid-responsive { grid-template-columns: 1fr !important; }
          .promise-grid-responsive { grid-template-columns: 1fr !important; }
          .trust-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .campus-areas-grid { grid-template-columns: 1fr !important; }
          .tutor-reward-banner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
