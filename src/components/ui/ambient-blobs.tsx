"use client";

/**
 * AmbientBlobs
 * Decorative background used on Hero, About, and Contact pages.
 * Two blurred gradient blobs — deep burgundy + gold — that independently
 * drift on slow 18–22s loops at low opacity.
 * Respects prefers-reduced-motion (CSS handles the stop via globals.css).
 */
export function AmbientBlobs() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Burgundy blob — top-left */}
      <div
        className="blob-burgundy absolute -left-24 -top-24
          h-[500px] w-[500px] rounded-full
          bg-[radial-gradient(circle,hsl(345_55%_32%)_0%,transparent_65%)]
          opacity-[0.22] blur-[100px]
          dark:bg-[radial-gradient(circle,hsl(345_50%_45%)_0%,transparent_65%)]
          dark:opacity-[0.18]"
      />
      {/* Gold blob — bottom-right */}
      <div
        className="blob-gold absolute -bottom-20 -right-20
          h-[440px] w-[440px] rounded-full
          bg-[radial-gradient(circle,hsl(40_65%_60%)_0%,transparent_65%)]
          opacity-[0.20] blur-[90px]
          dark:bg-[radial-gradient(circle,hsl(40_70%_55%)_0%,transparent_65%)]
          dark:opacity-[0.15]"
      />
      {/* Subtle mid-screen burgundy haze */}
      <div
        className="blob-burgundy absolute left-1/3 top-1/2
          h-[320px] w-[320px] rounded-full
          bg-[radial-gradient(circle,hsl(345_45%_28%)_0%,transparent_70%)]
          opacity-[0.10] blur-[80px]
          dark:opacity-[0.08]"
        style={{ animationDelay: "6s", animationDuration: "25s" }}
      />
    </div>
  );
}
