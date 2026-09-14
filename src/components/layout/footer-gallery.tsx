"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface FooterGalleryProps {
  images: string[];
}

export function FooterGallery({ images }: FooterGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || images.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // pixels per frame

    const autoScroll = () => {
      if (!isPaused && container) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll when we've scrolled through all images
        if (scrollPosition >= container.scrollWidth / 2) {
          scrollPosition = 0;
        }
        
        container.scrollLeft = scrollPosition;
      }
      animationId = requestAnimationFrame(autoScroll);
    };

    animationId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [images.length, isPaused]);

  if (images.length === 0) return null;

  // Duplicate images for seamless loop
  const displayImages = [...images.slice(0, 10), ...images.slice(0, 10)];

  return (
    <div 
      ref={scrollContainerRef}
      className="overflow-x-auto scrollbar-hide"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="flex sm:grid sm:grid-cols-5 lg:grid-cols-10">
        {displayImages.map((src, index) => (
          <div 
            key={`${src}-${index}`} 
            className="relative aspect-[4/5] w-[40vw] flex-shrink-0 opacity-70 grayscale transition duration-500 hover:opacity-100 hover:grayscale-0 sm:w-auto"
          >
            <Image 
              src={src} 
              alt="" 
              fill 
              className="object-cover" 
              sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 10vw" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
