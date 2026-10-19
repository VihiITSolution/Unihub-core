"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { getPromotionActions } from "./PromotionBannerContent";
import styles from "./CombinedPromotionBanner.module.css";

export default function CombinedPromotionBanner({ isAuthenticated, isVendor = false }: { isAuthenticated: boolean; isVendor?: boolean }) {
  const actions = getPromotionActions(isAuthenticated, isVendor);
  const trackRef = useRef<HTMLDivElement>(null);
  const [navigation, setNavigation] = useState({ previous: false, next: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const updateNavigation = () => setNavigation({
      previous: track.scrollLeft > 2,
      next: track.scrollLeft + track.clientWidth < track.scrollWidth - 2,
    });
    const observer = new ResizeObserver(updateNavigation);
    observer.observe(track);
    track.addEventListener("scroll", updateNavigation, { passive: true });
    updateNavigation();
    return () => { observer.disconnect(); track.removeEventListener("scroll", updateNavigation); };
  }, []);

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
      image: "/campus-walkway.png", alt: "University friends walking together on campus",
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
      image: "/library-study-group.png", alt: "Students sharing knowledge in a study group",
    },
  ];

  return (
    <section className={styles.section} aria-labelledby="promotion-title">
      <div className={styles.container}>
        <h2 id="promotion-title" className={styles.heading}>More ways to grow with UniHub</h2>
        <div className={styles.banner}>
          <div className={styles.intro}>
            <span className={styles.eyebrow}>Student &amp; vendor benefits</span>
            <h3>Make your UniHub time work harder for you.</h3>
            <p>Invite friends, sell what students need, or share your knowledge.</p>
            <div className={styles.tags}><span>Earn rewards</span><span>List free</span><span>Teach &amp; earn</span></div>
            <Link href={actions.affiliateVendor} className={styles.introAction}>Explore your rewards <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
          <div className={styles.carousel}>
            <div ref={trackRef} id="unihub-benefit-offers" className={styles.track} tabIndex={0} role="region" aria-label="Student and vendor offers">
              {offers.map((offer) => (
                <article key={offer.id} className={styles.card}>
                  {offer.image ? (
                    <img className={styles.image} src={offer.image} alt={offer.alt} loading="lazy" />
                  ) : (
                    <div className={styles.image} style={{ backgroundImage: "url('/unihub-discovery-triptych.png')", backgroundSize: "300% 100%", backgroundPosition: offer.position }} role="img" aria-label={offer.id === "marketplace" ? "Books, headphones, and other student essentials" : "A welcoming student boarding room"} />
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
            {navigation.previous && <button type="button" onClick={() => scrollOffers(-1)} className={[styles.arrow, styles.previous].join(" ")} aria-label="Previous benefits" aria-controls="unihub-benefit-offers"><ChevronLeft size={20} aria-hidden="true" /></button>}
            {navigation.next && <button type="button" onClick={() => scrollOffers(1)} className={[styles.arrow, styles.next].join(" ")} aria-label="More benefits" aria-controls="unihub-benefit-offers"><ChevronRight size={20} aria-hidden="true" /></button>}
          </div>
        </div>
      </div>
    </section>
  );
}
