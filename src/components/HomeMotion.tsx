"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./HomeMotion.module.css";

export default function HomeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cleanup = () => {};

    const initialize = () => {
      cleanup();
      cleanup = () => {};
      if (preference.matches) return;

      const registered = new WeakSet<HTMLElement>();
      const reveal = (element: HTMLElement) => {
        element.dataset.homeMotion = "visible";
        observer.unobserve(element);
      };
      const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      }, { threshold: 0.08 });

      const observe = (element: HTMLElement) => {
        if (registered.has(element)) return;
        registered.add(element);
        element.dataset.homeMotion = "pending";
        observer.observe(element);
      };

      const visitTargets = (element: HTMLElement, visit: (target: HTMLElement) => void) => {
        if (element.matches("[data-home-reveal]")) visit(element);
        element.querySelectorAll<HTMLElement>("[data-home-reveal]").forEach(visit);
      };
      visitTargets(root, observe);

      // Course cards arrive asynchronously and change when a category is selected.
      const updates = new MutationObserver((records) => {
        for (const record of records) {
          record.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && root.contains(node)) visitTargets(node, observe);
          });
          record.removedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement) || root.contains(node)) return;
            // Only visit removed reveal targets, rather than scanning every card.
            visitTargets(node, (element) => {
              observer.unobserve(element);
              registered.delete(element);
              delete element.dataset.homeMotion;
            });
          });
        }
      });
      updates.observe(root, { childList: true, subtree: true });

      // Keyboard users should never focus an invisible link while tabbing ahead.
      const handleFocus = (event: FocusEvent) => {
        if (!(event.target instanceof HTMLElement)) return;
        let element: HTMLElement | null = event.target;
        while (element && element !== root) {
          if (element.dataset.homeMotion === "pending" || element.dataset.homeMotion === "visible") {
            element.dataset.homeMotion = "complete";
            observer.unobserve(element);
          }
          element = element.parentElement;
        }
      };
      const finishReveal = (event: AnimationEvent) => {
        const element = event.target;
        if (element instanceof HTMLElement && element.dataset.homeMotion === "visible") {
          // Release the animation's transform so normal card hover styles can run.
          element.dataset.homeMotion = "complete";
        }
      };
      root.addEventListener("focusin", handleFocus);
      root.addEventListener("animationend", finishReveal);

      cleanup = () => {
        observer.disconnect();
        updates.disconnect();
        root.removeEventListener("focusin", handleFocus);
        root.removeEventListener("animationend", finishReveal);
        root.querySelectorAll<HTMLElement>("[data-home-motion]").forEach((element) => delete element.dataset.homeMotion);
      };
    };

    initialize();
    preference.addEventListener("change", initialize);
    return () => { cleanup(); preference.removeEventListener("change", initialize); };
  }, []);

  return <div ref={rootRef} className={styles.root}>{children}</div>;
}
