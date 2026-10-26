"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getPromotionActions } from "./PromotionBannerContent";
import styles from "./CombinedPromotionBanner.module.css";
import { useCarouselNavigation } from "@/hooks/useCarouselNavigation";
import { SHOW_TUTOR_VIDEO_PROMOTION } from "@/lib/promotionFlags";

export default function CombinedPromotionBanner({ isAuthenticated, isVendor = false }: { isAuthenticated: boolean; isVendor?: boolean }) {
  const actions = getPromotionActions(isAuthenticated, isVendor);
  const trackRef = useRef<HTMLDivElement>(null);
  const navigation = useCarouselNavigation(trackRef);

  const scrollOffers = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * .85,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const offers = [
    {
      id: "affiliate", label: "Affiliate rewards", title: "Invite friends. Earn rewards.",
      description: "Earn LKR 20–40 when a referred student or vendor becomes active.",
      href: actions.affiliateVendor, cta: isAuthenticated ? "Open affiliate hub" : "Start earning",
      image: "/campus-walkway.webp", alt: "University friends walking together on campus",
    },
    {
      id: "marketplace", label: "Free marketplace listings", title: "Sell your student essentials.",
      description: "List books, gadgets, and more for free during our 3-month promotion.",
      href: actions.marketplace, cta: "List on Marketplace", position: "center",
    },
    {
      id: "boarding", label: "Free boarding listings", title: "Help students find a home.",
      description: "Advertise your boarding place for free during our 3-month promotion.",
      href: actions.boarding, cta: "List a Boarding Place", position: "right center",
    },
    {
      id: "tutor", label: "Tutor video program", title: "Share what you know.",
      description: "Earn up to LKR 300 per qualifying video. Keep 90% of each completed sale after the promotion.",
      href: actions.tutor, cta: isAuthenticated ? "Become a tutor" : "Start teaching",
      image: "/library-study-group.webp", alt: "Students sharing knowledge in a study group",
    },
  ].filter((offer) => offer.id !== "tutor" || SHOW_TUTOR_VIDEO_PROMOTION);

  return (
    <section className={styles.section} aria-labelledby="promotion-title">
      <div className={styles.container}>
        <h2 id="promotion-title" className={styles.heading} data-home-reveal>More ways to grow with UniHub</h2>
        <div className={styles.banner}>
          <div className={styles.intro} data-home-reveal>
            <span className={styles.eyebrow}>Student &amp; vendor benefits</span>
            <h3>Make your UniHub time work harder for you.</h3>
            <p>Invite friends, sell what students need, or share your knowledge.</p>
            <div className={styles.tags}><span>Earn rewards</span><span>List free</span><span>Teach &amp; earn</span></div>
            <Link href={actions.affiliateVendor} className={styles.introAction}>Explore your rewards <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.carousel}>
            <div ref={trackRef} id="unihub-benefit-offers" className={styles.track} tabIndex={0} role="region" aria-label="Student and vendor offers">
              {offers.map((offer, index) => (
                <article key={offer.id} className={styles.card} data-home-reveal data-home-delay={String(Math.min(index + 1, 3))} data-home-hover>
                  {offer.image ? (
                    <img className={styles.image} src={offer.image} alt={offer.alt} loading="lazy" decoding="async" width={225} height={122} />
                  ) : (
                    <div className={styles.image} style={{ backgroundImage: "url('/unihub-discovery-triptych.webp')", backgroundSize: "300% 100%", backgroundPosition: offer.position }} role="img" aria-label={offer.id === "marketplace" ? "Books, headphones, and other student essentials" : "A welcoming student boarding room"} />
                  )}
                  <span className={styles.label}>{offer.label}</span>
                  <h3>{offer.title}</h3>
                  <p>{offer.description}</p>
                  {offer.id === "affiliate" && (
                    <div className={styles.tiers} aria-label="Rewards per active referral, by referral count">
                      <span>1–20<strong>LKR 20</strong></span><span>21–100<strong>LKR 30</strong></span><span>101+<strong>LKR 40</strong></span>
                    </div>
                  )}
                  <Link href={offer.href} className={styles.cardAction}>{offer.cta}<ArrowRight size={16} aria-hidden="true" /></Link>
                </article>
              ))}
            </div>
            {(navigation.previous || navigation.next) && (
              <div className={styles.controls} role="group" aria-label="Browse benefits">
                <button type="button" onClick={() => scrollOffers(-1)} className={styles.arrow} disabled={!navigation.previous} aria-label="Previous benefits" aria-controls="unihub-benefit-offers"><ChevronLeft size={20} aria-hidden="true" /></button>
                <button type="button" onClick={() => scrollOffers(1)} className={styles.arrow} disabled={!navigation.next} aria-label="More benefits" aria-controls="unihub-benefit-offers"><ChevronRight size={20} aria-hidden="true" /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
