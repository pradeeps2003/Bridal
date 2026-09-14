"use client";

import { useRef, useEffect, useState, ReactNode } from "react";
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Swipeable card component for mobile
interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  threshold?: number;
}

export function SwipeableCard({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  className = "",
  threshold = 100 
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offsetX = info.offset.x;

    if (offsetX > threshold) {
      onSwipeRight?.();
    } else if (offsetX < -threshold) {
      onSwipeLeft?.();
    }

    x.set(0);
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      style={{ x }}
      className={`touch-pan-y ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Touch-friendly bottom sheet for mobile
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
}

export function BottomSheet({ 
  isOpen, 
  onClose, 
  children, 
  maxHeight = "70vh" 
}: BottomSheetProps) {
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150) {
      onClose();
    } else {
      y.set(0);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y, maxHeight }}
            className="fixed bottom-0 left-0 right-0 bg-[var(--color-card)] rounded-t-3xl z-50 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: `calc(${maxHeight} - 40px)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Mobile carousel with swipe gestures
interface MobileCarouselProps {
  children: ReactNode[];
  className?: string;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
}

export function MobileCarousel({ 
  children, 
  className = "",
  autoPlay = false,
  interval = 3000,
  showControls = true,
}: MobileCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, children.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length);
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <motion.div
        className="flex"
        animate={{ x: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>

      {showControls && children.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrevious}
            aria-label="Previous testimonial"
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next testimonial"
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </>
      )}

      {showControls && children.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {children.map((_, index) => (
            <button
              type="button"
              key={index}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-[var(--color-accent)]" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Touch-friendly button with haptic feedback simulation
interface TouchButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function TouchButton({ 
  children, 
  onClick, 
  className = "",
  variant = "primary",
  size = "md"
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variantClasses = {
    primary: "bg-[var(--color-button)] text-[var(--color-on-button)]",
    secondary: "bg-[var(--color-secondary)] text-[var(--color-on-secondary)]",
    ghost: "bg-transparent text-[var(--color-foreground)]"
  };

  const sizeClasses = {
    sm: "h-10 px-4 text-sm",
    md: "h-12 px-6 text-base",
    lg: "h-14 px-8 text-lg"
  };

  const handleTouchStart = () => {
    setIsPressed(true);
    // Simulate haptic feedback on supported devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const handleTouchEnd = () => {
    setIsPressed(false);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      className={`
        rounded-full font-medium transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isPressed ? 'brightness-90' : 'brightness-100'}
        ${className}
      `}
      style={{ 
        minHeight: size === "sm" ? 40 : size === "md" ? 48 : 56,
        minWidth: size === "sm" ? 40 : size === "md" ? 48 : 56
      }}
    >
      {children}
    </motion.button>
  );
}

// Pull-to-refresh indicator
interface PullToRefreshProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  children: ReactNode;
}

export function PullToRefresh({ 
  isRefreshing, 
  onRefresh, 
  children 
}: PullToRefreshProps) {
  const [pullProgress, setPullProgress] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      const progress = Math.min(diff / 100, 1);
      setPullProgress(progress);
      
      if (progress >= 1 && !isRefreshing) {
        onRefresh();
        setStartY(0);
      }
    }
  };

  const handleTouchEnd = () => {
    setStartY(0);
    setPullProgress(0);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Refresh indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center pt-4"
        style={{ opacity: pullProgress }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
        >
          <svg className="h-6 w-6 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
      </motion.div>

      {children}
    </div>
  );
}
