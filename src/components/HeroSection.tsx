"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { BookOpen, CirclePlus, House, ShoppingBag } from "lucide-react";

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
      <div className="hero-shell" style={{ width: "min(1180px, calc(100% - 40px))", margin: "0 auto", position: "relative" }}>
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
            Find a kuppi before your deadline, buy or sell what you need, and compare boarding near your university, all in one place.
          </p>

        </div>

        <nav className="hero-actions" aria-label="Explore UniHub">
          <span className="hero-actions__label">Explore UniHub</span>
          <div className="hero-actions__grid">
            <Link href="/courses" className="hero-action hero-action--primary">
              <BookOpen size={18} aria-hidden="true" />
              Browse Kuppi Sessions
            </Link>
            <button type="button" onClick={handleCreateKuppi} className="hero-action hero-action--primary">
              <CirclePlus size={18} aria-hidden="true" />
              Create Your Kuppi
            </button>
            <Link href="/marketplace" className="hero-action">
              <ShoppingBag size={18} aria-hidden="true" />
              View Marketplace
            </Link>
            <Link href="/boarding" className="hero-action">
              <House size={18} aria-hidden="true" />
              Find Boarding
            </Link>
          </div>
        </nav>
      </div>
      <style jsx>{`
        .hero-actions {
          position: absolute; right: 0; bottom: 42px; width: min(390px, 35vw);
          padding: 16px; border: 1px solid rgba(255,255,255,.36); border-radius: 16px;
          background: rgba(4,51,45,.57); backdrop-filter: blur(14px);
          box-shadow: 0 18px 38px rgba(0,0,0,.2);
        }
        .hero-actions__label { display: block; margin-bottom: 10px; color: #a9f0df; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .hero-actions__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
        .hero-action {
          display: flex; min-height: 58px; align-items: center; gap: 9px; padding: 10px;
          border: 1px solid rgba(255,255,255,.35); border-radius: 10px; background: rgba(255,255,255,.08);
          color: #fff; font: inherit; font-size: 13px; font-weight: 800; line-height: 1.2; text-align: left;
          text-decoration: none; cursor: pointer; transition: transform .15s ease, background .15s ease;
        }
        .hero-action:hover { transform: translateY(-2px); background: rgba(255,255,255,.18); }
        .hero-action--primary { border-color: #d7f4ec; background: #fff; color: #08483f; }
        .hero-action--primary:hover { background: #e6fff6; }
        .hero-action:focus-visible { outline: 3px solid #a9f0df; outline-offset: 2px; }
        @media (max-width: 760px) {
          .hero-shell { padding: 0 !important; }
          .hero-actions { position: static; width: auto; margin: 0 0 32px; }
        }
        @media (max-width: 420px) { .hero-actions__grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
