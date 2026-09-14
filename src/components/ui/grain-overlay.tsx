"use client";

import { useEffect, useRef } from "react";

/**
 * GrainOverlay
 * Used on Packages / Services grid pages.
 * Renders a subtle animated grain texture over the section background.
 * Keep the parent element `position: relative; overflow: hidden`.
 */
export function GrainOverlay() {
  return (
    <div
      className="grain-overlay"
      aria-hidden="true"
    />
  );
}

/**
 * SparkleAccent
 * Small decorative sparkle SVGs that appear near headings on the packages page.
 * Each sparkle has a staggered pop animation.
 */
export function SparkleAccent({ count = 3 }: { count?: number }) {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 8 + Math.floor(i * 3.5),
    delay: `${i * 0.8}s`,
    top: `${-8 + i * 5}px`,
    right: `${-16 + i * 14}px`,
    color: i % 2 === 0 ? "hsl(40 65% 55%)" : "hsl(345 55% 45%)",
  }));

  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden="true">
      {sparkles.map((s) => (
        <svg
          key={s.id}
          className="sparkle-pop absolute"
          style={{
            top: s.top,
            right: s.right,
            animationDelay: s.delay,
            width: s.size,
            height: s.size,
          }}
          viewBox="0 0 24 24"
          fill={s.color}
        >
          <path d="M12 2l1.6 6.4L20 12l-6.4 1.6L12 22l-1.6-6.4L4 12l6.4-1.6z" />
        </svg>
      ))}
    </span>
  );
}
