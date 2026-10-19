"use client";

import { useEffect, useState, type RefObject } from "react";

export function useCarouselNavigation(trackRef: RefObject<HTMLDivElement | null>, refreshKey?: unknown) {
  const [navigation, setNavigation] = useState({ previous: false, next: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      setNavigation((current) => current.previous || current.next ? { previous: false, next: false } : current);
      return;
    }

    let frame = 0;
    const measure = () => {
      frame = 0;
      const previous = track.scrollLeft > 2;
      const next = track.scrollLeft + track.clientWidth < track.scrollWidth - 2;
      // Most scroll events don't change which buttons are enabled.
      setNavigation((current) => current.previous === previous && current.next === next
        ? current : { previous, next });
    };
    const scheduleMeasure = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    track.addEventListener("scroll", scheduleMeasure, { passive: true });
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      track.removeEventListener("scroll", scheduleMeasure);
    };
  }, [trackRef, refreshKey]);

  return navigation;
}
