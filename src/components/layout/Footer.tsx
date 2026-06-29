import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ padding: "34px 28px", background: "#151515", color: "#fff" }}>
      <div
        style={{
          width: "min(1180px, 100%)",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.4fr repeat(4, 1fr)",
          gap: 28,
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              style={{
                width: 38, height: 38, borderRadius: 7,
                background: "var(--brand)", color: "#fff",
                fontSize: 20, fontWeight: 800,
                display: "grid", placeItems: "center",
              }}
            >
              U
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>UniHub</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#b4690e", letterSpacing: "0.08em" }}>LEARN. EARN. GROW.</div>
            </div>
          </div>
          <p style={{ margin: 0, color: "#d7d7d7", fontSize: 14, lineHeight: 1.55 }}>
            Learn, earn, and grow with a practical education platform built for Sri Lankan university students.
          </p>
        </div>

        {/* Platform */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Platform</h4>
          {[
            { label: "Browse Kuppi Sessions", href: "/courses" },
            { label: "Marketplace", href: "/marketplace" },
            { label: "Boarding", href: "/boarding" },
            { label: "Become a Tutor", href: "/tutor/dashboard" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "block", marginBottom: 9, color: "#d7d7d7", fontSize: 14, lineHeight: 1.45 }} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Community */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Community</h4>
          {[
            { label: "Learner Stories", href: "/stories" },
            { label: "Teaching Center", href: "/tutor/dashboard" },
            { label: "Blog", href: "/blog" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "block", marginBottom: 9, color: "#d7d7d7", fontSize: 14, lineHeight: 1.45 }} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Support */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Support</h4>
          {[
            { label: "Help Center", href: "/help" },
            { label: "Contact Us", href: "mailto:support@unihub.lk" },
            { label: "Accessibility", href: "/accessibility" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "block", marginBottom: 9, color: "#d7d7d7", fontSize: 14, lineHeight: 1.45 }} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Legal */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Legal</h4>
          {[
            { label: "Terms", href: "/terms" },
            { label: "Privacy", href: "/privacy" },
            { label: "Cookies", href: "/cookies" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "block", marginBottom: 9, color: "#d7d7d7", fontSize: 14, lineHeight: 1.45 }} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          width: "min(1180px, 100%)",
          margin: "24px auto 0",
          paddingTop: 20,
          borderTop: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <p style={{ margin: 0, color: "#d7d7d7", fontSize: 13 }}>
          &copy; {currentYear} UniHub. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <select
            style={{
              background: "#222",
              border: "1px solid #333",
              color: "#d7d7d7",
              fontSize: 13,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            <option>English</option>
            <option>Sinhala</option>
            <option>Tamil</option>
          </select>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 980px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}
