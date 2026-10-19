"use client";

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
          background: `
            linear-gradient(90deg, rgba(7,63,56,.38) 0%, rgba(7,63,56,.18) 50%, rgba(7,63,56,.05) 100%),
            url("/hero-sri-lankan-students.png") center/cover
          `,
        }}
      >
        <div className="hero-copy" style={{ maxWidth: 470, padding: 32 }}>
          <p
            style={{
              margin: "0 0 10px",
              color: "var(--brand-dark)",
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
              color: "var(--muted)",
            }}
          >
            Find a kuppi before your deadline, buy or sell what you need, and compare boarding near your university, all in one place.
          </p>

        </div>

      </div>
      <style jsx>{`
        .hero-section { padding: 24px 0; }
        .hero-copy {
          margin-left: 34px; border: 1px solid rgba(255,255,255,.85); border-radius: 14px;
          background: rgba(255,255,255,.93); color: var(--ink); box-shadow: 0 15px 32px rgba(0,0,0,.16);
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
