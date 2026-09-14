"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  index: number;
  total: number;
  phase: AnimationPhase;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  label?: string;
}

// --- Card Dimensions ---
const IMG_WIDTH = 64;
const IMG_HEIGHT = 90;

// --- FlipCard Component ---
function FlipCard({ src, index, target, label }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 40,
        damping: 15,
      }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-[var(--color-muted)]"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={src}
            alt={label ?? `bridal-look-${index}`}
            className="h-full w-full object-cover"
          />
          {/* Subtle burgundy vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(345_55%_22%)]/30 to-transparent transition-opacity group-hover:opacity-0" />
        </div>

        {/* Back Face — Burgundy + Gold */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg
            bg-gradient-to-br from-[hsl(345_55%_18%)] to-[hsl(345_50%_28%)]
            flex flex-col items-center justify-center p-2
            border border-[hsl(40_65%_55%)]/40"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <Sparkles className="w-4 h-4 text-[hsl(40_65%_55%)] mb-1" />
          <p className="text-[7px] font-bold text-[hsl(40_65%_65%)] uppercase tracking-widest mb-0.5">
            Glow with Rubi
          </p>
          <p className="text-[8px] font-medium text-white/80 text-center leading-tight">
            {label ?? "Book Your Look"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Bridal Image Set — Unsplash ---
const IMAGES = [
  { src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80", label: "Bridal Glam" },
  { src: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80", label: "Reception Look" },
  { src: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80", label: "HD Makeup" },
  { src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80", label: "Bridal Makeup" },
  { src: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80", label: "Occasion Look" },
  { src: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80", label: "Party Makeup" },
  { src: "https://images.unsplash.com/photo-1560066984-138daaa8a5e4?w=400&q=80", label: "Saree Drape" },
  { src: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&q=80", label: "Engagement" },
  { src: "https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=400&q=80", label: "Floral Bride" },
  { src: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&q=80", label: "Wedding Day" },
  { src: "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=400&q=80", label: "Classic Bridal" },
  { src: "https://images.unsplash.com/photo-1511285560929-80b456503681?w=400&q=80", label: "South Indian" },
  { src: "https://images.unsplash.com/photo-1606216794079-73e0f3bb0e1f?w=400&q=80", label: "Hair Styling" },
  { src: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400&q=80", label: "Jewellery Look" },
  { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80", label: "Portrait Glow" },
  { src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", label: "Maternity" },
  { src: "https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=400&q=80", label: "Mehendi" },
  { src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&q=80", label: "Reception" },
  { src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80", label: "Bold Look" },
  { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", label: "Pastel Bride" },
];

const TOTAL_IMAGES = IMAGES.length;
const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

// --- Main Export ---
export default function ScrollMorphHero() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Container resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    obs.observe(containerRef.current);
    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });
    return () => obs.disconnect();
  }, []);

  // Window scroll
  const scrollY = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollY.set(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial value
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Morph progress: circle → bottom arc (scroll 0–400)
  const morphProgress = useTransform(scrollY, [0, 400], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  // Scroll rotation: after morph complete (400–1000)
  const scrollRotate = useTransform(scrollY, [400, 1000], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX.set(((e.clientX - rect.left) / rect.width * 2 - 1) * 80);
    };
    container.addEventListener("mousemove", onMove);
    return () => container.removeEventListener("mousemove", onMove);
  }, [mouseX]);

  // Intro sequence: scatter → line → circle
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("line"), 400);
    const t2 = setTimeout(() => setIntroPhase("circle"), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Scatter seed
  const scatterPositions = useMemo(() =>
    IMAGES.map(() => ({
      x: (Math.random() - 0.5) * 1600,
      y: (Math.random() - 0.5) * 1000,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.5,
      opacity: 0,
    })), []);

  // Subscribe to motion values for render
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const u1 = smoothMorph.on("change", setMorphValue);
    const u2 = smoothScrollRotate.on("change", setRotateValue);
    const u3 = smoothMouseX.on("change", setParallaxValue);
    return () => { u1(); u2(); u3(); };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // Overlay content driven by morph
  const contentOpacity = useTransform(smoothMorph, [0.5, 0.8], [0, 1]);
  const contentY = useTransform(smoothMorph, [0.5, 0.8], [24, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[var(--color-background)] overflow-hidden pt-20 sm:pt-24"
    >
      {/* Subtle burgundy+gold ambient tint */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(345_55%_22%/0.06),transparent)] dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,hsl(345_50%_45%/0.10),transparent)]" />

      <div className="flex h-full w-full flex-col items-center justify-center" style={{ perspective: "1000px" }}>

        {/* ── Intro Text: fades out as circle morphs ── */}
        <div className="absolute z-0 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4">
          <motion.div
            initial={{ opacity: 0, filter: "blur(12px)" }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, filter: "blur(0px)" }
                : { opacity: 0, filter: "blur(12px)" }
            }
            transition={{ duration: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            {/* Brand badge */}
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-card)]/80 px-4 py-1.5 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
                Glow with Rubi
              </span>
            </span>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[var(--color-foreground)] text-balance">
              Where every bride
              <span className="block bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent)]/80 to-[var(--color-accent)]/60 bg-clip-text text-transparent">
                glows with intention
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={introPhase === "circle" && morphValue < 0.6 ? { opacity: 0.6 - morphValue } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xs font-bold tracking-[0.22em] uppercase text-[var(--color-muted-foreground)]"
            >
              Scroll to explore
            </motion.p>
          </motion.div>
        </div>

        {/* ── CTA Buttons: Always visible at bottom of hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" variant="default" asChild className="h-11">
              <Link href="/book">
                <Sparkles className="mr-2 h-4 w-4" />
                Book Your Date
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11">
              <Link href="/packages">View Packages</Link>
            </Button>
          </div>
        </motion.div>

        {/* ── Arc Active Content: fades in post-morph ── */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="absolute top-[8%] z-10 flex flex-col items-center justify-center text-center pointer-events-none px-4"
        >
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-card)]/90 px-4 py-1.5 backdrop-blur-sm shadow-md">
            <Sparkles className="h-3 w-3 text-[var(--color-accent)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
              Artistry Archive
            </span>
          </span>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl sm:text-5xl lg:text-6xl font-semibold text-[var(--color-foreground)] tracking-tight leading-tight mb-3 text-balance">
            Curated<br />
            <span className="bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent)]/80 to-[var(--color-accent)]/50 bg-clip-text text-transparent">
              Bridal Looks
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-sm leading-relaxed mb-5">
            HD makeup · Saree draping · Jewellery styling<br className="hidden sm:block" />
            crafted for the length of a real wedding day.
          </p>
        </motion.div>

        {/* ── Image Cards ── */}
        <div className="relative flex items-center justify-center w-full h-full">
          {IMAGES.slice(0, TOTAL_IMAGES).map(({ src, label }, i) => {
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              const spacing = 74;
              const totalW = TOTAL_IMAGES * spacing;
              target = { x: i * spacing - totalW / 2, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              // Circle → Arc morph
              const isMobile = containerSize.width < 768;
              const minDim = Math.min(containerSize.width, containerSize.height);

              // Circle
              const circleRadius = Math.min(minDim * 0.34, 340);
              const circleAngle = (i / TOTAL_IMAGES) * 360;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              };

              // Arc (convex-up rainbow)
              const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
              const arcRadius = baseRadius * (isMobile ? 1.4 : 1.1);
              const arcApexY = containerSize.height * (isMobile ? 0.38 : 0.28);
              const arcCenterY = arcApexY + arcRadius;
              const spreadAngle = isMobile ? 95 : 125;
              const startAngle = -90 - spreadAngle / 2;
              const step = spreadAngle / (TOTAL_IMAGES - 1);

              const scrollProgress = Math.min(Math.max(rotateValue / 360, 0), 1);
              const boundedRotation = -scrollProgress * spreadAngle * 0.8;
              const currentArcAngle = startAngle + i * step + boundedRotation;
              const arcRad = (currentArcAngle * Math.PI) / 180;

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.35 : 1.75,
              };

              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: 1,
              };
            }

            return (
              <FlipCard
                key={i}
                src={src}
                index={i}
                total={TOTAL_IMAGES}
                phase={introPhase}
                target={target}
                label={label}
              />
            );
          })}
        </div>
      </div>

      {/* Scroll hint — disappears once morphed */}
      <motion.div
        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none"
        animate={{ opacity: morphValue > 0.3 ? 0 : 1, y: morphValue > 0.3 ? 8 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="h-4 w-px bg-[var(--color-accent)]/60"
        />
      </motion.div>
    </div>
  );
}
