"use client";

import { ReactNode, useRef, useEffect, useState } from "react";
import { useIntersectionObserver } from "@/hooks/use-intersection-observer";

interface LazyLoadProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
}

export function LazyLoad({
  children,
  className,
  threshold = 0.1,
  rootMargin = "100px",
  fallback = null,
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [elementRef, isVisible] = useIntersectionObserver({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  useEffect(() => {
    if (isVisible && !isLoaded) {
      setIsLoaded(true);
    }
  }, [isVisible, isLoaded]);

  return (
    <div ref={elementRef} className={className}>
      {isLoaded ? children : fallback}
    </div>
  );
}
