"use client";

import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section
      className="hero-section"
      style={{
        background: "#fff",
      }}
    >
      <div
        className="hero-shell"
        style={{
          width: "min(1180px, calc(100% - 40px))", minHeight: 410, margin: "0 auto", position: "relative",
          display: "grid", alignItems: "center", overflow: "hidden", borderRadius: 16,
          background: "#073f38",
        }}
      >
        <img
          className="hero-image"
          src="/hero-sri-lankan-students.webp"
          srcSet="/hero-sri-lankan-students-768.webp 768w, /hero-sri-lankan-students.webp 1600w"
          sizes="(max-width: 1220px) calc(100vw - 40px), 1180px"
          alt=""
          width={1600}
          height={900}
          fetchPriority="high"
          decoding="async"
        />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-copy" style={{ maxWidth: 470, padding: 32 }}>
          <p
            data-home-hero
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
            data-home-hero
            data-home-delay="1"
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
            data-home-hero
            data-home-delay="2"
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

          <a href="/auth/register" className="hero-start" data-home-hover>
            Get started <ArrowRight size={19} aria-hidden="true" />
          </a>
        </div>

      </div>
      <style jsx>{`
        .hero-section { padding: 24px 0; }
        .hero-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(7,63,56,.38) 0%, rgba(7,63,56,.18) 50%, rgba(7,63,56,.05) 100%); }
        .hero-copy {
          position: relative; margin-left: 34px; color: #fff;
        }
        .hero-start { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; gap: 16px; padding: 12px 22px; border: 1px solid #b9f3d5; border-radius: 9px; background: #b9f3d5; color: #073f38; font-size: 15px; font-weight: 800; text-decoration: none; transition: background .2s ease, transform .2s ease; }
        .hero-start:hover { background: #d9fbe9; transform: translateY(-2px); }
        .hero-start:focus-visible { outline: 3px solid #fff; outline-offset: 4px; }
        @media (prefers-reduced-motion: reduce) {
          :global(html) { scroll-behavior: auto; }
          .hero-start { transition: none; }
          .hero-start:hover { transform: none; }
        }
        @media (max-width: 760px) {
          .hero-section { padding: 16px 0; }
          .hero-shell { display: block !important; min-height: 0 !important; }
          .hero-copy { margin: 20px; padding: 24px !important; }
        }
      `}</style>
    </section>
  );
}
