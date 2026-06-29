"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface HoverCardProps {
  trigger: React.ReactNode;
  popup: React.ReactNode;
  popupWidth?: number;
}

export function HoverCard({ trigger, popup, popupWidth = 316 }: HoverCardProps) {
  const [visible, setVisible] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");
  const [topOffset, setTopOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const showTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const calcPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    setSide(spaceRight >= popupWidth + 16 ? "right" : "left");
    // Clamp vertical: don't overflow below viewport
    const popupH = 420;
    const overflow = rect.top + popupH - window.innerHeight;
    setTopOffset(overflow > 0 ? -overflow - 12 : 0);
  }, [popupWidth]);

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    calcPosition();
    showTimer.current = setTimeout(() => setVisible(true), 280);
  };

  const handleMouseLeave = () => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 120);
  };

  useEffect(() => {
    return () => {
      clearTimeout(showTimer.current);
      clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {trigger}

      {visible && (
        <div
          style={{
            position: "absolute",
            top: topOffset,
            ...(side === "right"
              ? { left: "calc(100% + 10px)" }
              : { right: "calc(100% + 10px)" }),
            width: popupWidth,
            zIndex: 200,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            boxShadow: "0 12px 40px rgba(0,0,0,.18), 0 2px 8px rgba(0,0,0,.08)",
            overflow: "hidden",
            pointerEvents: "auto",
          }}
          onMouseEnter={() => {
            clearTimeout(hideTimer.current);
            setVisible(true);
          }}
          onMouseLeave={handleMouseLeave}
        >
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: 24,
              ...(side === "right" ? { left: -7 } : { right: -7 }),
              width: 13, height: 13,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRight: side === "right" ? "none" : "1px solid #e2e8f0",
              borderTop: side === "right" ? "none" : "1px solid #e2e8f0",
              borderBottom: side === "right" ? "1px solid #e2e8f0" : "none",
              borderLeft: side === "right" ? "1px solid #e2e8f0" : "none",
              transform: side === "right" ? "rotate(45deg)" : "rotate(-135deg)",
            }}
          />
          {popup}
        </div>
      )}
    </div>
  );
}
