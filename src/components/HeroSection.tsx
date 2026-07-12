"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

export default function HeroSection() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleCreateKuppi = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      // Land the new user on the tutor application after they register,
      // instead of the generic student dashboard - register() doesn't
      // support a "tutor" account type directly, so becoming a tutor is a
      // follow-up application step for a normal student account.
      sessionStorage.setItem("redirectAfterLogin", "/student/become-tutor");
      router.push("/auth/register");
      return;
    }
    if (user?.roles?.includes("tutor")) {
      router.push("/tutor/create-course");
    } else {
      // Already has an account - send them to apply, not back to registration.
      router.push("/student/become-tutor");
    }
  };

  return (
    <section
      style={{
        minHeight: 340,
        display: "grid",
        alignItems: "center",
        background: `
          linear-gradient(90deg, rgba(7,63,56,.95) 0%, rgba(7,63,56,.80) 48%, rgba(7,63,56,.12) 78%),
          url("/hero-sri-lankan-students.png") center/cover
        `,
        color: "#fff",
      }}
    >
      <div style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto" }}>
        <div style={{ maxWidth: 580, padding: "42px 0" }}>
          <p
            style={{
              margin: "0 0 10px",
              color: "#a9f0df",
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            UniHub for Sri Lankan undergraduates
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(36px, 5vw, 58px)",
              lineHeight: 1.02,
              fontWeight: 800,
            }}
          >
            Your campus shortcut for kuppi sessions and student life
          </h1>

          <p
            style={{
              maxWidth: 510,
              margin: "16px 0 24px",
              fontSize: 19,
              lineHeight: 1.45,
              color: "#e0f7f4",
            }}
          >
            Find peer-led kuppi sessions before deadlines, buy or sell student essentials, discover boarding near your university, and move through the semester with less stress.
          </p>

          {/* Hero pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {["Assignment rescue", "Viva confidence", "Peer-to-peer learning", "Boarding near campus"].map((pill) => (
              <span
                key={pill}
                style={{
                  padding: "7px 10px",
                  border: "1px solid rgba(255,255,255,.48)",
                  background: "rgba(255,255,255,.12)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Link
              href="/courses"
              style={{
                height: 48,
                display: "inline-flex",
                alignItems: "center",
                padding: "0 20px",
                border: "1px solid #fff",
                background: "#fff",
                color: "var(--ink)",
                fontSize: 14,
                fontWeight: 800,
                textDecoration: "none",
                transition: "background .15s",
              }}
            >
              Browse Kuppi Sessions
            </Link>
            <button
              onClick={handleCreateKuppi}
              style={{
                height: 48,
                display: "inline-flex",
                alignItems: "center",
                padding: "0 20px",
                border: "1px solid rgba(255,255,255,.7)",
                background: "transparent",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                transition: "background .15s",
              }}
            >
              Create Your Kuppi
            </button>
          </div>

          {/* Social proof */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.15)" }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, color: "#a9f0df", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Trusted by students from
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              {["University of Colombo", "University of Moratuwa", "SLIIT", "NSBM"].map((uni) => (
                <span key={uni} style={{ fontSize: 13, color: "#d7f4ec", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a9f0df", display: "inline-block" }} />
                  {uni}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
