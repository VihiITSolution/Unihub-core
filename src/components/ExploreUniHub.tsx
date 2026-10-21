"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const EXPLORE_AREAS = [
  { title: "Kuppi sessions", description: "Learn together", href: "/courses", image: "/unihub-discovery-triptych.webp", position: "left center", size: "300% 100%" },
  { title: "Marketplace", description: "Buy and sell", href: "/marketplace", image: "/unihub-discovery-triptych.webp", position: "center", size: "300% 100%" },
  { title: "Boarding", description: "Find your place", href: "/boarding", image: "/unihub-discovery-triptych.webp", position: "right center", size: "300% 100%" },
  { title: "Become a tutor", description: "Share what you know", href: "/student/become-tutor", image: "/library-study-group.webp", position: "center", size: "cover" },
  { title: "Student network", description: "Research & connect", href: "/wall", image: "/campus-walkway.webp", position: "center", size: "cover" },
];

export default function ExploreUniHub() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const moveCards = useCallback((direction: "previous" | "next") => {
    const cards = cardsRef.current;
    const firstCard = cards?.querySelector<HTMLElement>(".explore-unihub__card");
    if (!cards || !firstCard) return;

    const cardWidth = firstCard.getBoundingClientRect().width + 16;
    const maxScrollLeft = cards.scrollWidth - cards.clientWidth;
    const isAtStart = cards.scrollLeft <= 2;
    const isAtEnd = cards.scrollLeft >= maxScrollLeft - 2;

    cards.scrollTo({
      left:
        direction === "next"
          ? isAtEnd
            ? 0
            : Math.min(cards.scrollLeft + cardWidth, maxScrollLeft)
          : isAtStart
            ? maxScrollLeft
            : Math.max(cards.scrollLeft - cardWidth, 0),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    if (isPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => moveCards("next"), 5000);
    return () => window.clearInterval(interval);
  }, [isPaused, moveCards]);

  return (
    <section className="explore-unihub" aria-labelledby="explore-unihub-title">
      <div className="explore-unihub__inner">
        <div className="explore-unihub__intro" data-home-reveal>
          <span>Explore UniHub</span>
          <h2 id="explore-unihub-title">Everything for student life, in one place.</h2>
          
        </div>
        <div
          className="explore-unihub__carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setIsPaused(false);
            }
          }}
        >
          <div className="explore-unihub__cards" ref={cardsRef}>
            {EXPLORE_AREAS.map((area, index) => (
              <Link
                key={area.title}
                href={area.href}
                className="explore-unihub__card"
                data-home-reveal
                data-home-delay={String(index + 1)}
                data-home-hover
                style={{
                  minHeight: 370,
                  backgroundImage: `url('${area.image}')`,
                  backgroundPosition: area.position,
                  backgroundSize: area.size,
                }}
              >
                <div className="explore-unihub__card-label">
                  <span>{area.description}</span>
                  <strong>{area.title}</strong>
                  <ArrowRight size={20} aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
          <div className="explore-unihub__controls" aria-label="Explore UniHub carousel controls">
            <button type="button" onClick={() => moveCards("previous")} aria-label="Show previous cards">
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => moveCards("next")} aria-label="Show next cards">
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <style jsx>{`
        .explore-unihub { padding: 48px 0 36px; background: #fff; }
        .explore-unihub__inner { width: min(1180px, calc(100% - 40px)); margin: 0 auto; display: grid; grid-template-columns: .88fr 2.12fr; gap: 34px; align-items: center; }
        .explore-unihub__intro > span { color: var(--brand-dark); font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .explore-unihub__intro h2 { margin: 8px 0 12px; font-size: clamp(27px, 3vw, 38px); line-height: 1.14; font-weight: 800; letter-spacing: -.025em; }
        .explore-unihub__intro p { max-width: 295px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.5; }
        .explore-unihub__carousel { min-width: 0; }
        .explore-unihub__cards { display: grid; grid-auto-columns: calc((100% - 32px) / 3); grid-auto-flow: column; gap: 16px; overflow-x: auto; padding: 2px 2px 12px; scroll-snap-type: x mandatory; scrollbar-width: thin; }
        .explore-unihub__card { position: relative; display: flex; align-items: flex-end; overflow: hidden; border-radius: 16px; box-shadow: 0 12px 22px rgba(15,23,42,.12); scroll-snap-align: start; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
        .explore-unihub__card::before { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 38%, rgba(4,35,31,.28) 100%); content: ""; }
        .explore-unihub__card:hover { transform: translateY(-5px); box-shadow: 0 20px 30px rgba(15,23,42,.18); }
        .explore-unihub__card-label { position: absolute; right: 12px; bottom: 12px; left: 12px; display: grid; min-height: 92px; grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 2px 12px; padding: 17px; border-radius: 11px; background: rgba(255,255,255,.96); color: var(--ink); }
        .explore-unihub__card-label span { grid-column: 1; color: var(--muted); font-size: 12px; }
        .explore-unihub__card-label strong { grid-column: 1; font-size: 18px; line-height: 1.2; }
        .explore-unihub__card-label :global(svg) { grid-column: 2; grid-row: 1 / -1; align-self: center; color: var(--brand-dark); }
        .explore-unihub__card:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
        .explore-unihub__controls { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; }
        .explore-unihub__controls button { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border: 1px solid #cbd5e1; border-radius: 999px; background: #fff; color: var(--brand-dark); cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
        .explore-unihub__controls button:hover { background: var(--brand-dark); color: #fff; transform: translateY(-1px); }
        .explore-unihub__controls button:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; }
        @media (max-width: 980px) { .explore-unihub__inner { grid-template-columns: 1fr; gap: 24px; } .explore-unihub__intro p { max-width: 560px; } .explore-unihub__cards { grid-auto-columns: calc((100% - 16px) / 2); } }
        @media (max-width: 640px) { .explore-unihub { padding: 36px 0 26px; } .explore-unihub__cards { grid-auto-columns: 86%; } .explore-unihub__card { min-height: 280px !important; } }
      `}</style>
    </section>
  );
}
