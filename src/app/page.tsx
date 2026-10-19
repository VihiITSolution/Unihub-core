"use client";

import { useState } from "react";
import Link from "next/link";
import { RoleUpgradeModal } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import type { RoleType } from "@/components/ui/RoleUpgradeModal";
import FeaturedCoursesCarousel from "@/components/FeaturedCoursesCarousel";
import ExploreUniHub from "@/components/ExploreUniHub";
import HeroSection from "@/components/HeroSection";
import CombinedPromotionBanner from "@/components/CombinedPromotionBanner";
import CampusLifePanel from "@/components/CampusLifePanel";

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

      <ExploreUniHub />

      {/* Featured courses / kuppi sessions */}
      <FeaturedCoursesCarousel />

      <CampusLifePanel />

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
          .career-grid-responsive { grid-template-columns: 1fr !important; }
          .trust-grid-responsive { grid-template-columns: repeat(3, 1fr) !important; }
          .testimonials-responsive { grid-template-columns: 1fr !important; }
          .tutor-reward-banner { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .stats-grid-responsive { grid-template-columns: 1fr !important; }
          .trust-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
          .tutor-reward-banner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
