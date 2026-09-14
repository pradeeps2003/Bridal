"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Bookmark, Sparkles } from "lucide-react";

// Heart/Like animation component
interface HeartButtonProps {
  isLiked?: boolean;
  onLike?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function HeartButton({ 
  isLiked = false, 
  onLike, 
  size = "md",
  className = "" 
}: HeartButtonProps) {
  const [showParticles, setShowParticles] = useState(false);

  const handleClick = () => {
    if (!isLiked) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 600);
    }
    onLike?.();
  };

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClick}
        className={`rounded-full flex items-center justify-center transition-colors ${
          isLiked 
            ? "bg-red-50 text-red-500" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        } ${sizeClasses[size]} ${className}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isLiked ? "liked" : "unliked"}
            initial={{ scale: 0.5, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, rotate: 90 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Heart 
              className={iconSizes[size]} 
              fill={isLiked ? "currentColor" : "none"}
            />
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Heart burst particles */}
      <AnimatePresence>
        {showParticles && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 pointer-events-none"
                initial={{ scale: 0, opacity: 1 }}
                animate={{
                  scale: 2,
                  opacity: 0,
                  rotate: i * 60
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Heart 
                  className="w-full h-full text-red-400"
                  fill="currentColor"
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Bookmark animation component
interface BookmarkButtonProps {
  isBookmarked?: boolean;
  onBookmark?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function BookmarkButton({ 
  isBookmarked = false, 
  onBookmark, 
  size = "md",
  className = "" 
}: BookmarkButtonProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-10 w-10"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onBookmark}
      className={`rounded-full flex items-center justify-center transition-colors ${
        isBookmarked 
          ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${sizeClasses[size]} ${className}`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isBookmarked ? "bookmarked" : "unbookmarked"}
          initial={{ scale: 0.5, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.5, y: -10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Bookmark 
            className={iconSizes[size]} 
            fill={isBookmarked ? "currentColor" : "none"}
          />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// Ripple effect for buttons
interface RippleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function RippleButton({ 
  children, 
  onClick, 
  className = "",
  disabled = false 
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y
    };

    setRipples([...ripples, newRipple]);
    onClick?.();

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            initial={{ 
              width: 0, 
              height: 0, 
              x: ripple.x, 
              y: ripple.y,
              opacity: 0.5
            }}
            animate={{
              width: 300,
              height: 300,
              x: ripple.x - 150,
              y: ripple.y - 150,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}

// Sparkle animation for premium elements
interface SparkleEffectProps {
  className?: string;
  count?: number;
}

export function SparkleEffect({ className = "", count = 3 }: SparkleEffectProps) {
  return (
    <div className={`relative ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 2,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 1
          }}
          style={{
            left: `${20 + i * 30}%`,
            top: `${20 + i * 20}%`
          }}
        >
          <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
        </motion.div>
      ))}
    </div>
  );
}

// Magnetic button effect
interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  strength?: number;
}

export function MagneticButton({ 
  children, 
  onClick, 
  className = "",
  strength = 20 
}: MagneticButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}
