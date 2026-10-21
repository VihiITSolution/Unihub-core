"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const CARD_GAP = 18;

// Add, remove, or change cards here without changing the carousel behaviour.
const EXPLORE_AREAS = [
  {
    title: "Kuppi sessions",
    description: "Learn together",
    href: "/courses",
    image: "/library-study-group.webp",
    position: "center",
  },
  {
    title: "Marketplace",
    description: "Buy and sell",
    href: "/marketplace",
    image: "/unihub-discovery-triptych.webp",
    position: "center",
  },
  {
    title: "Boarding",
    description: "Find your place",
    href: "/boarding",
    image: "/unihub-discovery-triptych.webp",
    position: "right center",
  },
  {
    title: "Become a tutor",
    description: "Share what you know",
    href: "/student/become-tutor",
    image: "/library-study-group.webp",
    position: "center",
  },
  {
    title: "Student network",
    description: "Research & connect",
    href: "/wall",
    image: "/campus-walkway.webp",
    position: "center",
  },
];

const getSlidesPerView = () => {
  if (window.innerWidth <= 640) return 1;
  if (window.innerWidth <= 980) return 2;
  return 3;
};

export default function ExploreUniHub() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);
  const preventCardClick = useRef(false);
  const [slidesPerView, setSlidesPerView] = useState(3);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeStart, setActiveStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const maxStart = Math.max(0, EXPLORE_AREAS.length - slidesPerView);
  const pageStarts = useMemo(() => {
    const starts = [0];
    while (starts[starts.length - 1] < maxStart) {
      starts.push(Math.min(starts[starts.length - 1] + slidesPerView, maxStart));
    }
    return starts;
  }, [maxStart, slidesPerView]);
  const activePage = pageStarts.indexOf(activeStart);
  const cardStep = viewportWidth ? (viewportWidth + CARD_GAP) / slidesPerView : 0;

  const goToPage = useCallback(
    (page: number) => {
      const nextPage = (page + pageStarts.length) % pageStarts.length;
      setActiveStart(pageStarts[nextPage]);
    },
    [pageStarts],
  );

  const goToPrevious = useCallback(() => {
    goToPage(activePage <= 0 ? pageStarts.length - 1 : activePage - 1);
  }, [activePage, goToPage, pageStarts.length]);

  const goToNext = useCallback(() => {
    goToPage(activePage >= pageStarts.length - 1 ? 0 : activePage + 1);
  }, [activePage, goToPage, pageStarts.length]);

  useEffect(() => {
    const updateLayout = () => {
      const nextSlidesPerView = getSlidesPerView();
      setSlidesPerView(nextSlidesPerView);
      setActiveStart((current) => {
        const nextMaxStart = Math.max(0, EXPLORE_AREAS.length - nextSlidesPerView);
        return current >= nextMaxStart
          ? nextMaxStart
          : Math.floor(current / nextSlidesPerView) * nextSlidesPerView;
      });
      setViewportWidth(viewportRef.current?.clientWidth ?? 0);
    };

    updateLayout();
    const resizeObserver = new ResizeObserver(updateLayout);
    if (viewportRef.current) resizeObserver.observe(viewportRef.current);
    window.addEventListener("resize", updateLayout);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, []);

  const finishDrag = (clientX?: number) => {
    if (pointerStartX.current === null) return;
    const distance = (clientX ?? pointerStartX.current) - pointerStartX.current;
    if (Math.abs(distance) > 48) {
      preventCardClick.current = true;
      distance < 0 ? goToNext() : goToPrevious();
    }
    pointerStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <section className="explore-unihub" aria-labelledby="explore-unihub-title">
      <div className="explore-unihub__inner">
        <div className="explore-unihub__intro" data-home-reveal>
          <span>Explore UniHub</span>
          <h2 id="explore-unihub-title">Everything for student life, in one place.</h2>
          <p>Study support, student deals, and a place to stay—made for university life.</p>
        </div>

        <div className="explore-unihub__carousel" data-home-reveal data-home-delay="1">
          <div
            ref={viewportRef}
            className="explore-unihub__viewport"
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Explore UniHub services"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                goToPrevious();
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                goToNext();
              }
            }}
            onPointerDown={(event) => {
              pointerStartX.current = event.clientX;
              preventCardClick.current = false;
              event.currentTarget.setPointerCapture(event.pointerId);
              setIsDragging(true);
            }}
            onPointerMove={(event) => {
              if (pointerStartX.current !== null) {
                setDragOffset(event.clientX - pointerStartX.current);
              }
            }}
            onPointerUp={(event) => finishDrag(event.clientX)}
            onPointerCancel={() => finishDrag()}
          >
            <div
              className="explore-unihub__track"
              style={{
                gap: CARD_GAP,
                gridAutoColumns: `calc((100% - ${(slidesPerView - 1) * CARD_GAP}px) / ${slidesPerView})`,
                transform: `translate3d(${-activeStart * cardStep + dragOffset}px, 0, 0)`,
                transition: isDragging ? "none" : "transform 500ms ease",
              }}
            >
              {EXPLORE_AREAS.map((area) => (
                <Link
                  key={area.title}
                  href={area.href}
                  className="explore-unihub__card"
                  draggable={false}
                  onClick={(event) => {
                    if (preventCardClick.current) {
                      event.preventDefault();
                      preventCardClick.current = false;
                    }
                  }}
                  style={{
                    backgroundImage: `url('${area.image}')`,
                    backgroundPosition: area.position,
                  }}
                >
                  <div className="explore-unihub__card-label">
                    <span>{area.description}</span>
                    <strong>{area.title}</strong>
                    <ArrowRight size={21} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="explore-unihub__navigation">
            <div className="explore-unihub__pagination" aria-label="Carousel pages">
              {pageStarts.map((start, index) => (
                <button
                  key={start}
                  type="button"
                  className={index === activePage ? "is-active" : ""}
                  aria-label={`Show carousel page ${index + 1}`}
                  aria-current={index === activePage ? "true" : undefined}
                  onClick={() => goToPage(index)}
                />
              ))}
            </div>
            <div className="explore-unihub__controls">
              <button type="button" onClick={goToPrevious} aria-label="Show previous cards">
                <ArrowLeft size={19} aria-hidden="true" />
              </button>
              <button type="button" onClick={goToNext} aria-label="Show next cards">
                <ArrowRight size={19} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .explore-unihub { overflow: hidden; padding: 56px 0 44px; background: #fff; }
        .explore-unihub__inner { width: min(1180px, calc(100% - 40px)); margin: 0 auto; display: grid; grid-template-columns: minmax(250px, .88fr) minmax(0, 2.12fr); gap: 34px; align-items: center; }
        .explore-unihub__intro > span { color: var(--brand-dark); font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
        .explore-unihub__intro h2 { margin: 8px 0 12px; font-size: clamp(27px, 3vw, 38px); line-height: 1.14; font-weight: 800; letter-spacing: -.025em; }
        .explore-unihub__intro p { max-width: 295px; margin: 0; color: var(--muted); font-size: 15px; line-height: 1.5; }
        .explore-unihub__carousel { min-width: 0; }
        .explore-unihub__viewport { width: 100%; overflow: hidden; border-radius: 18px; outline: none; touch-action: pan-y; cursor: grab; }
        .explore-unihub__viewport:focus-visible { outline: 3px solid var(--brand); outline-offset: 4px; }
        .explore-unihub__viewport:active { cursor: grabbing; }
        .explore-unihub__track { display: grid; grid-auto-flow: column; will-change: transform; }
        .explore-unihub__card { position: relative; display: flex; width: 100%; min-width: 0; min-height: 370px; align-items: flex-end; overflow: hidden; border-radius: 16px; background-color: #e2e8f0; background-repeat: no-repeat; background-size: cover; box-shadow: 0 12px 22px rgba(15,23,42,.12); text-decoration: none; transition: transform .25s ease, box-shadow .25s ease; user-select: none; }
        .explore-unihub__card::before { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 42%, rgba(4,35,31,.32) 100%); content: ""; }
        .explore-unihub__card:hover { transform: translateY(-5px) scale(1.01); box-shadow: 0 20px 30px rgba(15,23,42,.18); }
        .explore-unihub__card-label { position: absolute; right: 12px; bottom: 12px; left: 12px; display: grid; min-height: 92px; grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 2px 12px; padding: 17px; border-radius: 11px; background: rgba(255,255,255,.96); color: var(--ink); }
        .explore-unihub__card-label span { grid-column: 1; color: var(--muted); font-size: 12px; }
        .explore-unihub__card-label strong { grid-column: 1; font-size: 18px; line-height: 1.2; }
        .explore-unihub__card-label :global(svg) { grid-column: 2; grid-row: 1 / -1; align-self: center; color: var(--brand-dark); }
        .explore-unihub__card:focus-visible { outline: 3px solid var(--brand); outline-offset: -3px; }
        .explore-unihub__navigation { display: flex; align-items: center; justify-content: space-between; min-height: 54px; padding-top: 12px; }
        .explore-unihub__pagination { display: flex; align-items: center; gap: 7px; }
        .explore-unihub__pagination button { width: 7px; height: 7px; padding: 0; border: 0; border-radius: 999px; background: #cbd5e1; cursor: pointer; transition: width .25s ease, background .25s ease; }
        .explore-unihub__pagination button.is-active { width: 28px; background: #7c3aed; }
        .explore-unihub__pagination button:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; }
        .explore-unihub__controls { display: flex; gap: 9px; }
        .explore-unihub__controls button { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; padding: 0; border: 1px solid #cbd5e1; border-radius: 50%; background: #fff; color: var(--brand-dark); cursor: pointer; transition: background .2s ease, color .2s ease, transform .2s ease; }
        .explore-unihub__controls button:hover { background: var(--brand-dark); color: #fff; transform: translateY(-1px); }
        .explore-unihub__controls button:focus-visible { outline: 3px solid var(--brand); outline-offset: 3px; }
        @media (max-width: 980px) { .explore-unihub__inner { grid-template-columns: 1fr; gap: 24px; } .explore-unihub__intro p { max-width: 560px; } }
        @media (max-width: 640px) { .explore-unihub { padding: 42px 0 30px; } .explore-unihub__inner { width: min(100% - 32px, 560px); } .explore-unihub__card { min-height: 330px; } .explore-unihub__navigation { padding-top: 10px; } }
        @media (prefers-reduced-motion: reduce) { .explore-unihub__track, .explore-unihub__card, .explore-unihub__pagination button, .explore-unihub__controls button { transition: none !important; } }
      `}</style>
    </section>
  );
}
