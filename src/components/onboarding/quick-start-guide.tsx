"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type TargetKey = "packages" | "book" | "whatsapp";

type GuideStep = {
  target: TargetKey;
  eyebrow: string;
  title: string;
  description: string;
};

const GUIDE_STEPS: GuideStep[] = [
  {
    target: "packages",
    eyebrow: "Step 1 of 3",
    title: "Explore our packages",
    description: "Browse bridal and occasion makeup looks with detailed inclusions, timings, and transparent pricing.",
  },
  {
    target: "book",
    eyebrow: "Step 2 of 3",
    title: "Book your appointment",
    description: "Select your preferred package, choose an available time slot, and provide your event details to secure your date.",
  },
  {
    target: "whatsapp",
    eyebrow: "Step 3 of 3",
    title: "Get instant support",
    description: "Have questions? Chat with us directly on WhatsApp for quick responses about your look, travel, or any extras.",
  },
];

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function QuickStartGuide() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const step = GUIDE_STEPS[stepIndex];

  const finish = useCallback(() => {
    window.localStorage.setItem("glow-with-rubi:quick-start-seen", "true");
    setOpen(false);
    setTargetRect(null);
  }, []);

  const measureTarget = useCallback(() => {
    const element = document.querySelector<HTMLElement>(`[data-quick-start="${step.target}"]`);
    if (!element) {
      setTargetRect(null);
      return;
    }
    const rect = element.getBoundingClientRect();
    setTargetRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
  }, [step.target]);

  useEffect(() => {
    if (window.localStorage.getItem("glow-with-rubi:quick-start-seen")) return;
    const timer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const element = document.querySelector<HTMLElement>(`[data-quick-start="${step.target}"]`);
    element?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const measureTimer = window.setTimeout(measureTarget, 350);
    const handleViewportChange = () => measureTarget();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, { passive: true });
    nextButtonRef.current?.focus();
    return () => {
      window.clearTimeout(measureTimer);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange);
    };
  }, [measureTarget, open, step.target]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight") setStepIndex((current) => Math.min(current + 1, GUIDE_STEPS.length - 1));
      if (event.key === "ArrowLeft") setStepIndex((current) => Math.max(current - 1, 0));
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [finish, open]);

  if (!open || !targetRect) return null;

  const cardWidth = Math.min(336, window.innerWidth - 32);
  const cardLeft = Math.min(Math.max(16, targetRect.left + targetRect.width / 2 - cardWidth / 2), window.innerWidth - cardWidth - 16);
  const placeAbove = targetRect.top > window.innerHeight * 0.58;
  const cardTop = placeAbove
    ? Math.max(16, targetRect.top - 190)
    : Math.min(window.innerHeight - 190, targetRect.top + targetRect.height + 20);
  const Arrow = placeAbove ? ArrowDownRight : ArrowUpRight;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-[rgba(35,20,18,0.48)]" aria-hidden="true" />
      <div
        className="pointer-events-none fixed z-[61] rounded-xl border-2 border-[var(--color-accent)] shadow-[0_0_0_5px_rgba(215,127,109,0.22)] transition-all duration-300"
        style={{ top: targetRect.top - 5, left: targetRect.left - 5, width: targetRect.width + 10, height: targetRect.height + 10 }}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="quick-start-title"
        aria-describedby="quick-start-description"
        className="fixed z-[62]"
        style={{ top: cardTop, left: cardLeft, width: cardWidth }}
      >
        <div className="relative border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-2xl">
          <Arrow className={`absolute h-9 w-9 text-[var(--color-accent)] ${placeAbove ? "-bottom-7 left-8" : "-top-8 right-8"}`} aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">{step.eyebrow}</p>
            <button type="button" onClick={finish} aria-label="Skip quick start guide" className="rounded-sm p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
          <h2 id="quick-start-title" className="mt-2 font-[family-name:var(--font-heading)] text-2xl">{step.title}</h2>
          <p id="quick-start-description" className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">{step.description}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-label={`Guide step ${stepIndex + 1} of ${GUIDE_STEPS.length}`}>
              {GUIDE_STEPS.map((item, index) => <span key={item.target} className={`h-1.5 w-5 rounded-full transition-all ${index === stepIndex ? "bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"}`} aria-hidden="true" />)}
            </div>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && <Button type="button" variant="ghost" size="sm" onClick={() => setStepIndex((current) => current - 1)} aria-label="Previous guide step"><ArrowLeft className="h-4 w-4" /></Button>}
              <Button ref={nextButtonRef} type="button" variant="accent" size="sm" className="font-semibold" onClick={() => stepIndex === GUIDE_STEPS.length - 1 ? finish() : setStepIndex((current) => current + 1)}>
                {stepIndex === GUIDE_STEPS.length - 1 ? <><Check className="h-4 w-4 mr-2" /> Got it, thanks!</> : <>Continue <ArrowRight className="h-4 w-4 ml-2" /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
