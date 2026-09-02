"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl sm:rounded-[1.4rem] bg-gradient-to-br from-rose-100 to-pink-200">
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {PORTFOLIO_IMAGES.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={image}
              alt={`Portfolio work ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        ))}
      </div>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      {/* Image counter */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 flex gap-2">
        {PORTFOLIO_IMAGES.map((_, index) => (
          <div
            key={index}
            className={`h-1.5 w-1.5 rounded-full transition-all ${
              index === currentIndex ? "w-4 sm:w-6 bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>

      {/* Floating badge */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 rounded-full bg-white/90 px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg backdrop-blur-sm">
        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-rose-600">
          Our Work
        </p>
      </div>
    </div>
  );
}