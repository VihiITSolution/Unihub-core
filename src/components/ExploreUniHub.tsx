"use client";

import Link from "next/link";
import styles from "./ExploreUniHub.module.css";
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
  const pointerStartY = useRef(0);
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
      const nextStart = pageStarts[nextPage];
      const viewport = viewportRef.current;
      const focused = document.activeElement;
      if (viewport && focused instanceof HTMLElement && focused.closest("a") && viewport.contains(focused)) {
        const focusedIndex = Array.from(viewport.querySelectorAll("a")).indexOf(focused.closest("a")!);
        if (focusedIndex < nextStart || focusedIndex >= nextStart + slidesPerView) {
          viewport.focus({ preventScroll: true });
        }
      }
      setActiveStart(nextStart);
    },
    [pageStarts, slidesPerView],
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
    if (preventCardClick.current && Math.abs(distance) > 48) {
      distance < 0 ? goToNext() : goToPrevious();
    }
    pointerStartX.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  return (
    <section id="explore-unihub" className={styles.section} aria-labelledby="explore-unihub-title">
      <div className={styles.inner}>
        <div className={styles.intro} data-home-reveal>
          <span>Explore UniHub</span>
          <h2 id="explore-unihub-title">Everything for student life, in one place.</h2>
          <p>Study support, student deals, and a place to stay—made for university life.</p>
        </div>

        <div className={styles.carousel} data-home-reveal data-home-delay="1">
          <div
            ref={viewportRef}
            className={styles.viewport}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Explore UniHub services"
            onKeyDown={(event) => {
              if (event.key === "Enter") preventCardClick.current = false;
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
              if (event.button !== 0 || !event.isPrimary) return;
              pointerStartX.current = event.clientX;
              pointerStartY.current = event.clientY;
              preventCardClick.current = false;
            }}
            onPointerMove={(event) => {
              if (pointerStartX.current !== null) {
                const distance = event.clientX - pointerStartX.current;
                const verticalDistance = event.clientY - pointerStartY.current;
                if (!preventCardClick.current && (Math.abs(distance) < 8 || Math.abs(distance) < Math.abs(verticalDistance))) return;
                preventCardClick.current = true;
                // Capture only a real horizontal drag; normal clicks must reach the link.
                if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.setPointerCapture(event.pointerId);
                }
                setIsDragging(true);
                setDragOffset(distance);
              }
            }}
            onPointerUp={(event) => finishDrag(event.clientX)}
            onPointerCancel={() => finishDrag()}
            onLostPointerCapture={() => finishDrag()}
          >
            <div
              className={styles.track}
              style={{
                gap: CARD_GAP,
                gridAutoColumns: `calc((100% - ${(slidesPerView - 1) * CARD_GAP}px) / ${slidesPerView})`,
                transform: `translate3d(${-activeStart * cardStep + dragOffset}px, 0, 0)`,
                transition: isDragging ? "none" : "transform 500ms ease",
              }}
            >
              {EXPLORE_AREAS.map((area, index) => (
                <Link
                  key={area.title}
                  href={area.href}
                  className={styles.card}
                  draggable={false}
                  tabIndex={index >= activeStart && index < activeStart + slidesPerView ? 0 : -1}
                  aria-hidden={index < activeStart || index >= activeStart + slidesPerView}
                  onClick={(event) => {
                    if (preventCardClick.current) {
                      event.preventDefault();
                      preventCardClick.current = false;
                    }
                  }}
                  style={{
                    backgroundImage: `url('${area.image}')`,
                    backgroundPosition: area.position,
                    backgroundSize: area.image.includes("triptych") ? "300% 100%" : "cover",
                  }}
                >
                  <div className={styles.cardLabel}>
                    <span>{area.description}</span>
                    <strong>{area.title}</strong>
                    <ArrowRight size={21} aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.navigation}>
            <div className={styles.pagination} aria-label="Carousel pages">
              {pageStarts.map((start, index) => (
                <button
                  key={start}
                  type="button"
                  className={index === activePage ? styles.active : undefined}
                  aria-label={`Show carousel page ${index + 1}`}
                  aria-current={index === activePage ? "true" : undefined}
                  onClick={() => goToPage(index)}
                />
              ))}
            </div>
            <div className={styles.controls}>
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


    </section>
  );
}
