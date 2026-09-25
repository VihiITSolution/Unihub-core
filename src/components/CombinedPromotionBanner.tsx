"use client";

import Link from "next/link";
import { getPromotionActions } from "./PromotionBannerContent";

export default function CombinedPromotionBanner({ isAuthenticated, isVendor = false }: { isAuthenticated: boolean; isVendor?: boolean }) {
  const actions = getPromotionActions(isAuthenticated, isVendor);

  return (
    <section className="combined-promotion" aria-label="UniHub promotions">
      <div className="combined-promotion__inner">
        <div className="combined-promotion__intro">
          <span className="combined-promotion__eyebrow">UniHub student &amp; vendor benefits</span>
          <h2>Make your UniHub time work harder for you.</h2>
          <p>Invite active students or vendors, list what students need, or teach with video. Every offer is a simple way to earn and grow on UniHub.</p>
        </div>

        <article className="promotion-card promotion-card--affiliate">
          <span className="promotion-card__label">Student &amp; vendor affiliate</span>
          <h3>Invite friends. Earn rewards.</h3>
          <p>Share your personal link and earn LKR 20–40 when a referred student or vendor becomes active on UniHub.</p>
          <div className="promotion-card__tier-row" aria-label="Affiliate reward tiers">
            <span>1–20 <strong>LKR 20</strong></span><span>21–100 <strong>LKR 30</strong></span><span>101+ <strong>LKR 40</strong></span>
          </div>
          <Link
            href={actions.affiliateVendor}
            className="promotion-card__button promotion-card__button--light"
            style={{ display: "flex", width: "100%", minHeight: 46, marginTop: "auto", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 16px", borderRadius: 8, background: "#ffffff", color: "#08483f", fontWeight: 800, textDecoration: "none", boxSizing: "border-box" }}
          >
            {isAuthenticated ? "Open affiliate hub" : "Start earning"} <span aria-hidden="true">→</span>
          </Link>
        </article>

        <article className="promotion-card promotion-card--listings">
          <span className="promotion-card__label">Free listings</span>
          <h3>List free for 3 months.</h3>
          <p>Sell useful student items or advertise a boarding place during UniHub’s promotional period.</p>
          <div className="promotion-card__listing-links" style={{ marginTop: "auto" }}>
            <Link
              href={actions.marketplace}
              className="promotion-card__button promotion-card__button--listing"
              style={{ display: "flex", width: "100%", minHeight: 46, alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 14px", border: "1px solid #b77912", borderRadius: 8, background: "#fffaf0", color: "#543900", fontWeight: 800, textDecoration: "none", boxSizing: "border-box" }}
            >
              <span>List on Marketplace</span><span aria-hidden="true">→</span>
            </Link>
            <Link
              href={actions.boarding}
              className="promotion-card__button promotion-card__button--listing"
              style={{ display: "flex", width: "100%", minHeight: 46, alignItems: "center", justifyContent: "space-between", gap: 8, padding: "0 14px", border: "1px solid #b77912", borderRadius: 8, background: "#fffaf0", color: "#543900", fontWeight: 800, textDecoration: "none", boxSizing: "border-box" }}
            >
              <span>List a Boarding Place</span><span aria-hidden="true">→</span>
            </Link>
          </div>
        </article>

        <article className="promotion-card promotion-card--tutor">
          <span className="promotion-card__label">Tutor video tutorial program</span>
          <h3>Create tutorials. Earn more.</h3>
          <p>Earn up to LKR 300 per qualifying video and keep 90% of each completed sale after the promotion.</p>
          <Link
            href={actions.tutor}
            className="promotion-card__button promotion-card__button--tutor"
            style={{ display: "flex", width: "100%", minHeight: 46, marginTop: "auto", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 16px", borderRadius: 8, background: "#bbf7d0", color: "#073f38", fontWeight: 800, textDecoration: "none", boxSizing: "border-box" }}
          >
            {isAuthenticated ? "Become a tutor" : "Start teaching"} <span aria-hidden="true">→</span>
          </Link>
        </article>
      </div>

      <style jsx>{`
        .combined-promotion { background: linear-gradient(115deg, #053f38 0%, #0b665a 58%, #18786b 100%); color: #fff; border-bottom: 1px solid rgba(255,255,255,.18); }
        .combined-promotion__inner { width: min(1180px, calc(100% - 40px)); margin: 0 auto; display: grid; grid-template-columns: 1.1fr repeat(3, 1fr); gap: 16px; padding: 28px 0; align-items: stretch; }
        .combined-promotion__intro { display: flex; flex-direction: column; justify-content: center; padding: 6px 10px 6px 0; }.combined-promotion__eyebrow, .promotion-card__label { display: inline-flex; align-self: flex-start; margin-bottom: 9px; font-size: 10px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }.combined-promotion__eyebrow { color: #a9f0df; }.combined-promotion h2 { margin: 0; max-width: 440px; font-size: clamp(25px, 3vw, 35px); line-height: 1.08; font-weight: 800; letter-spacing: -.025em; }.combined-promotion__intro p { margin: 10px 0 0; max-width: 470px; color: #d7f4ec; font-size: 14px; line-height: 1.5; }
        .promotion-card { display: flex; flex-direction: column; min-width: 0; padding: 19px; border-radius: 12px; }.promotion-card--affiliate { border: 1px solid rgba(255,255,255,.27); background: rgba(255,255,255,.11); }.promotion-card--listings { color: #17322e; border: 1px solid rgba(255,223,157,.72); background: #fff1d5; }.promotion-card--tutor { border: 1px solid rgba(167,243,208,.42); background: rgba(2,44,34,.38); }.promotion-card--affiliate .promotion-card__label { color: #a9f0df; }.promotion-card--listings .promotion-card__label { color: #9a5a00; }.promotion-card--tutor .promotion-card__label { color: #bbf7d0; }.promotion-card h3 { margin: 0; font-size: 20px; line-height: 1.2; font-weight: 800; }.promotion-card p { margin: 8px 0 0; font-size: 13px; line-height: 1.48; }.promotion-card--affiliate p, .promotion-card--tutor p { color: #e2f7f0; }.promotion-card--listings p { color: #5d5547; }
        .promotion-card__tier-row { display: flex; gap: 7px; margin: 15px 0; }.promotion-card__tier-row span { flex: 1; padding: 7px 5px; color: #dff9ef; border-radius: 7px; background: rgba(0,0,0,.13); text-align: center; font-size: 10px; font-weight: 700; }.promotion-card__tier-row strong { display: block; margin-top: 2px; color: #fff; font-size: 12px; }.promotion-card__button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 46px; margin-top: auto; padding: 0 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 800; transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }.promotion-card__button:hover { transform: translateY(-1px); box-shadow: 0 5px 12px rgba(0,0,0,.18); }.promotion-card__button:focus-visible, .promotion-card__listing-links a:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }.promotion-card__button--light { color: #08483f; background: #fff; }.promotion-card__button--light:hover { background: #e6fff6; }.promotion-card__button--tutor { color: #073f38; background: #bbf7d0; }.promotion-card__button--tutor:hover { background: #dcfce7; }.promotion-card__listing-links { display: grid; gap: 10px; margin-top: 16px; }.promotion-card__listing-links a { display: flex; align-items: center; justify-content: space-between; min-height: 46px; padding: 0 14px; border: 1px solid #b77912; border-radius: 8px; color: #543900; background: #fffaf0; box-shadow: 0 2px 0 rgba(154,90,0,.15); text-decoration: none; font-size: 13px; font-weight: 800; transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }.promotion-card__listing-links a:hover { transform: translateY(-1px); background: #fff; box-shadow: 0 5px 12px rgba(84,57,0,.18); }
        @media (max-width: 980px) { .combined-promotion__inner { grid-template-columns: 1fr 1fr; } .combined-promotion__intro { grid-column: 1 / -1; padding-right: 0; } } @media (max-width: 640px) { .combined-promotion__inner { width: min(100% - 28px, 1180px); grid-template-columns: 1fr; padding: 22px 0; } .combined-promotion__intro { grid-column: auto; } .promotion-card { padding: 17px; } }
      `}</style>
    </section>
  );
}
