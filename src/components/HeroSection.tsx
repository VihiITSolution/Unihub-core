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
    </section>
  );
}
