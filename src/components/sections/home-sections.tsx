"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Sparkles, Star } from "lucide-react";

import { DEFAULT_HERO_IMAGE_URLS } from "@/lib/brand-media";
import { Button } from "@/components/ui/button";
import SocialCards from "@/components/ui/card-fan-carousel";
import { packagesToServices, ServiceCarousel } from "@/components/ui/services-card";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import { HeroBookButton } from "./hero-book-button";
import type { Package } from "@/types";

const MARQUEE = ["HD makeup", "Saree draping", "Jewellery setting", "Home service", "Reception glam", "Engagement looks"];

const POPULAR_TYPES = new Set(["popular", "most_ordered", "premium"]);

export function HeroSection({
  className,
  imageUrls = [...DEFAULT_HERO_IMAGE_URLS],
}: {
  className?: string;
  imageUrls?: string[];
}) {
  const fanCards = imageUrls.map((imgUrl, index) => ({
    imgUrl,
    alt: `Glow with Rubi showcase look ${index + 1}`,
    linkUrl: "/packages",
  }));

  return (
    <section
      className={`relative isolate overflow-hidden bg-[var(--color-background)] pt-20 sm:pt-24 ${className ?? ""}`}
      aria-label="Hero"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,hsl(345_55%_22%/0.10),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,hsl(40_65%_55%/0.10),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 pt-8 text-center sm:px-6 sm:pt-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--color-accent)] sm:text-[10px] sm:tracking-[0.42em]"
        >
          Glow with Rubi · Pollachi
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="font-[family-name:var(--font-heading)] text-[2.5rem] font-medium leading-[0.95] text-[var(--color-foreground)] sm:text-5xl md:text-6xl"
        >
          Made to
          <span className="mt-1 block italic text-[var(--color-accent)]">glow on camera.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--color-muted-foreground)] sm:text-sm"
        >
          Tap to explore looks, swipe the carousel, or book your date — bridal HD from Pollachi, across Coimbatore and Tamil Nadu.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="mt-6 flex w-full flex-col justify-center gap-3 px-2 sm:w-auto sm:flex-row sm:flex-wrap sm:px-0"
        >
          <HeroBookButton />
          <Button size="lg" variant="outline" asChild className="h-12 w-full rounded-full px-7 sm:w-auto">
            <Link href="/packages">See signature looks</Link>
          </Button>
        </motion.div>
      </div>

      {fanCards.length > 0 ? (
        <div className="block sm:block">
          <SocialCards cards={fanCards} />
        </div>
      ) : null}

      <div className="relative z-10 overflow-hidden border-t border-[var(--color-border)] py-3 sm:py-3">
        <div className="flex w-max animate-[marquee-x_28s_linear_infinite] gap-8 pr-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted-foreground)] sm:gap-10 sm:pr-10 sm:text-[10px] sm:tracking-[0.28em]">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-2 whitespace-nowrap sm:gap-3">
              <Sparkles className="h-3 w-3 flex-shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedPackagesSection({ packages }: { packages: Package[] }) {
  const [tab, setTab] = useState<"signature" | "popular">("signature");
  const signature = packages.slice(0, 4);
  const popular = packages.filter((pkg) => POPULAR_TYPES.has(pkg.package_type ?? "") || /premium|luxury/i.test(pkg.name)).slice(0, 4);
  const slides = tab === "popular" && popular.length ? popular : signature;

  return (
    <section className="section-padding bg-[var(--color-background)]">
      <div className="container-narrow px-4">
        <ScrollAnimate animation="fade-up" delay={0.08}>
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)] sm:text-[10px] sm:tracking-[0.28em]">
                Signature lookbook
              </p>
              <h2 className="max-w-md font-[family-name:var(--font-heading)] text-[1.75rem] leading-tight text-[var(--color-foreground)] sm:text-3xl md:text-4xl">
                A few looks. Chosen, not listed.
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-full border border-[var(--color-border)] p-1">
                {(["signature", "popular"] as const).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
                    className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${
                      tab === id
                        ? "bg-[var(--color-button)] text-[var(--color-on-button)]"
                        : "text-[var(--color-muted-foreground)]"
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
              <Link
                href="/packages"
                className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]"
              >
                Full catalogue →
              </Link>
            </div>
          </div>
        </ScrollAnimate>
        <ServiceCarousel services={packagesToServices(slides)} />
      </div>
    </section>
  );
}

export function TestimonialsSection({
  testimonials: initialTestimonials,
}: {
  testimonials?: Array<{ quote: string; name: string; event: string; rating?: number }>;
}) {
  const testimonials = initialTestimonials?.length
    ? initialTestimonials.slice(0, 4)
    : [
        {
          quote: "Rubi understood exactly the soft, glowing look I wanted. I felt like myself — just the most radiant version.",
          name: "Ananya S.",
          event: "Bridal",
          rating: 5,
        },
        {
          quote: "Professional, calm, and incredibly skilled. My makeup lasted through the ceremony, photos, and reception.",
          name: "Priya M.",
          event: "Reception",
          rating: 5,
        },
        {
          quote: "The home service was seamless. She arrived on time with everything organized.",
          name: "Kavya R.",
          event: "Engagement",
          rating: 5,
        },
      ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [testimonials.length]);

  const current = testimonials[index];

  return (
    <section className="relative overflow-hidden bg-[hsl(345_40%_8%)] py-16 text-white sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <Image
          src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=60"
          alt=""
          fill
          className="object-cover blur-2xl"
        />
      </div>
      <div className="absolute inset-0 bg-[hsl(345_40%_8%)]/78" />
      <div className="container-narrow relative mx-auto max-w-3xl px-4 text-center">
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)] sm:mb-8 sm:text-[10px] sm:tracking-[0.32em]">Kind words</p>
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={current.name + index}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-5 flex justify-center gap-1">
              {Array.from({ length: current.rating || 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[var(--color-accent)] text-[var(--color-accent)]" />
              ))}
            </div>
            <p className="px-2 font-[family-name:var(--font-heading)] text-[1.35rem] leading-snug text-white sm:px-0 sm:text-2xl md:text-4xl">
              “{current.quote}”
            </p>
            <footer className="mt-6 text-xs uppercase tracking-[0.18em] text-white/60 sm:mt-8 sm:tracking-[0.22em]">
              {current.name} · {current.event}
            </footer>
          </motion.blockquote>
        </AnimatePresence>
        <div className="mt-8 flex justify-center gap-2 sm:mt-10">
          {testimonials.map((item, i) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Show ${item.name}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all ${i === index ? "w-8 bg-[var(--color-accent)]" : "w-3 bg-white/30"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqPreviewSection() {
  const faqs = [
    {
      q: "How far in advance should I book?",
      a: "We recommend booking 3–6 months ahead for wedding season. Last-minute dates may still be available.",
    },
    {
      q: "Do you travel for home service?",
      a: "Yes. Home service is available across select locations. Travel charges are shown before you confirm.",
    },
    {
      q: "What is included in a bridal package?",
      a: "Each package lists its inclusions — makeup, hairstyle, draping, and accessories.",
    },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section className="section-padding bg-[var(--color-background)]">
      <div className="container-narrow grid items-start gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr]">
        <ScrollAnimate animation="fade-left" delay={0.08}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)] sm:text-[10px] sm:tracking-[0.28em]">FAQ</p>
          <h2 className="font-[family-name:var(--font-heading)] text-[1.75rem] leading-tight text-[var(--color-foreground)] sm:text-3xl md:text-4xl">
            Before you book
          </h2>
          <Link href="/faq" className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-accent)] sm:tracking-[0.14em]">
            All questions →
          </Link>
        </ScrollAnimate>
        <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {faqs.map((faq, index) => {
            const isOpen = open === index;
            return (
              <div key={faq.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 py-4 text-left sm:gap-4 sm:py-5"
                  aria-expanded={isOpen}
                >
                  <span className="font-[family-name:var(--font-heading)] text-[1.1rem] leading-tight text-[var(--color-foreground)] sm:text-xl">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--color-accent)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pb-5 text-sm leading-relaxed text-[var(--color-muted-foreground)]"
                    >
                      {faq.a}
                    </motion.p>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
