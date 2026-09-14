"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const PORTFOLIO_IMAGES = [
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80",
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PORTFOLIO_IMAGES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl
        shadow-[0_0_0_1px_var(--color-accent),0_0_32px_4px_color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
    >
      {/* Crossfade images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <Image
            src={PORTFOLIO_IMAGES[currentIndex]}
            alt={`Portfolio work ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Bottom overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

      {/* Dot indicators */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {PORTFOLIO_IMAGES.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-6 bg-white"
                : "w-1.5 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Floating "Our Work" badge */}
      <div className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1.5 shadow-lg backdrop-blur-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Our Work
        </p>
      </div>
    </div>
  );
}