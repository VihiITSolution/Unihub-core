"use client";

import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

const SOCIAL_LINKS = [
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@unihub.lk?is_from_webapp=1&sender_device=pc",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.34v13.26a2.81 2.81 0 1 1-2.81-2.81c.28 0 .55.04.81.13V9.19a6.18 6.18 0 1 0 5.34 6.12V8.58a8.16 8.16 0 0 0 4.77 1.52V6.76c-.34 0-.67-.02-1-.07Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/unihub.lk/",
    icon: <Instagram size={20} aria-hidden="true" />,
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61593843214755",
    icon: <Facebook size={20} aria-hidden="true" />,
  },
];

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
            { label: "Become a Tutor", href: "/student/become-tutor" },
          ].map((link) => (
            <Link key={link.href} href={link.href} style={{ display: "block", marginBottom: 9, color: "#d7d7d7", fontSize: 14, lineHeight: 1.45 }} className="hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Social profiles */}
        <div>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 800 }}>Follow us</h4>
          <nav className="footer-socials" aria-label="UniHub social media">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`UniHub on ${social.name} (opens in a new tab)`}
                title={social.name}
                className="footer-social-link"
              >
                {social.icon}
              </a>
            ))}
          </nav>
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
        .footer-socials { display: flex; flex-wrap: wrap; gap: 10px; }
        .footer-social-link { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; flex-shrink: 0; border: 1px solid #424242; border-radius: 10px; background: #222; color: #fff; text-decoration: none; transition: background .2s ease, border-color .2s ease, color .2s ease; }
        .footer-social-link:hover { border-color: #a9f0df; background: #073f38; color: #a9f0df; }
        .footer-social-link:focus-visible { outline: 3px solid #a9f0df; outline-offset: 3px; }
        @media (prefers-reduced-motion: reduce) { .footer-social-link { transition: none; } }
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
