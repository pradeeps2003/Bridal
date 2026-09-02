"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PackageCard } from "@/components/ui/package-card";
import { HeroCarousel } from "@/components/sections/hero-carousel";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getPackageSalePrice } from "@/lib/pricing/calculate";
import type { Package } from "@/types";
import { Sparkles } from "lucide-react";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section
      className={`relative overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)] ${className ?? ""}`}
    >
      <div className="absolute inset-0 opacity-90">
        <div className="absolute -left-16 top-20 h-72 w-72 rounded-full bg-[var(--color-accent)]/20 blur-3xl" aria-hidden />
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-[var(--color-accent)]/30 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[var(--color-accent)]/25 blur-3xl" aria-hidden />
      </div>

      <div className="container-wide relative section-padding pb-10 pt-16 sm:pt-20 lg:pb-14">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
          <div className="max-w-2xl space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-card)]/80 px-3 py-1.5 shadow-[0_10px_25px_rgba(214,127,109,0.08)] backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)] sm:text-xs">
                GLOW. GRACE. GLAMOUR.
              </span>
            </div>

            <h1 className="text-balance font-[family-name:var(--font-heading)] text-3xl font-bold leading-[0.92] text-[var(--color-foreground)] sm:text-4xl lg:text-[4.5rem]">
              Where every bride
              <span className="mt-2 block bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent)]/80 to-[var(--color-accent)]/60 bg-clip-text text-transparent">
                glows with intention
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted-foreground)] sm:text-base">
              HD makeup, saree draping, and jewellery styling — built for the length of a real wedding day.
            </p>

            <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-stretch">
              <Button
                size="lg"
                variant="modern"
                asChild
                className="h-12 w-full sm:flex-1"
              >
                <Link href="/book" data-quick-start="book">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Check Availability
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-12 w-full border-[var(--color-border)] bg-[var(--color-card)]/80 text-[var(--color-foreground)] sm:flex-1"
              >
                <Link href="/packages" data-quick-start="packages">View Packages</Link>
              </Button>
            </div>

            <div className="grid max-w-xl grid-cols-3 items-stretch gap-2 sm:gap-3 pt-2 sm:pt-3 lg:pt-4">
              {[
                "Saree Draping Styles",
                "HD & Non-HD Options",
                "Home Service Available",
              ].map((stat, index) => (
                <div
                  key={index}
                  className="equal-card rounded-xl sm:rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]/80 p-2 sm:p-3 flex items-center justify-center"
                >
                  <p className="font-[family-name:var(--font-heading)] text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--color-accent)] text-center leading-tight">
                    {stat}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 order-last">
            <HeroCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}

export function FeaturedPackagesSection({ packages }: { packages: Package[] }) {
  const featured = packages.slice(0, 3);

  return (
    <section className="section-padding bg-[var(--color-background)]">
      <div className="container-narrow">
        <ScrollReveal>
          <div className="mb-4 sm:mb-6 lg:mb-8 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-3 sm:py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-2">
                <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                  Bridal Packages
                </p>
              </div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl sm:text-2xl lg:text-3xl text-[var(--color-foreground)]">
                Curated Packages
              </h2>
            </div>
            <Link
              href="/packages"
              className="text-xs sm:text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-colors"
            >
              View all packages →
            </Link>
          </div>
        </ScrollReveal>

        {/* Static grid layout for all devices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((pkg, index) => {
            const salePrice = getPackageSalePrice(pkg);
            return (
              <ScrollReveal key={pkg.id} delay={index * 100} className="relative h-full">
                {index === 1 && (
                  <span className="absolute right-3 top-3 z-20 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-on-accent)] rounded-full shadow-lg shadow-[var(--color-accent)]/25">
                    Popular
                  </span>
                )}
                <PackageCard
                  pkg={pkg}
                  showSaleBadge={!!salePrice}
                  salePrice={salePrice || undefined}
                  inclusionsPreview={2}
                />
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection({ testimonials: initialTestimonials }: { testimonials?: Array<{ quote: string; name: string; event: string }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] = useState(
    initialTestimonials || [
      {
        quote:
          "Rubi understood exactly the soft, glowing look I wanted. I felt like myself — just the most radiant version.",
        name: "Ananya S.",
        event: "Bridal",
      },
      {
        quote:
          "Professional, calm, and incredibly skilled. My makeup lasted through the ceremony, photos, and reception.",
        name: "Priya M.",
        event: "Reception",
      },
      {
        quote:
          "The home service was seamless. She arrived on time with everything organized. Truly premium experience.",
        name: "Kavya R.",
        event: "Engagement",
      },
    ]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="section-padding bg-gradient-to-b from-[var(--color-muted)]/20 to-[var(--color-background)] dark:from-[var(--color-muted)]/10 dark:to-[var(--color-background)]">
      <div className="container-narrow">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-card)] border border-[var(--color-border)] mb-3">
              <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                Testimonials
              </p>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-foreground)]">
              Kind words
            </h2>
          </div>
        </ScrollReveal>

        <div className="mt-4 sm:mt-6">
          <ScrollReveal>
            <blockquote className="equal-card max-w-2xl mx-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5">
              <p className="text-sm sm:text-base leading-relaxed text-[var(--color-muted-foreground)]">
                &ldquo;{testimonials[currentIndex].quote}&rdquo;
              </p>
              <footer className="mt-3 sm:mt-4 border-t border-[var(--color-border)] pt-2 sm:pt-3">
                <p className="text-sm font-medium text-[var(--color-foreground)]">{testimonials[currentIndex].name}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{testimonials[currentIndex].event}</p>
              </footer>
            </blockquote>
            <div className="flex justify-center gap-2 mt-2 sm:mt-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex ? "w-4 sm:w-6 bg-[var(--color-accent)]" : "bg-[var(--color-muted)]"
                  }`}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export function FaqPreviewSection() {
  const faqs = [
    {
      q: "How far in advance should I book?",
      a: "We recommend booking 3–6 months ahead for wedding season. Last-minute dates may be available.",
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

  return (
    <section className="section-padding bg-gradient-to-b from-[var(--color-background)] to-[var(--color-muted)]/20 dark:from-[var(--color-background)] dark:to-[var(--color-muted)]/10">
      <div className="container-narrow">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 mb-2">
              <Sparkles className="w-3 h-3 text-[var(--color-accent)]" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
                FAQ
              </p>
            </div>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl text-[var(--color-foreground)]">
              Common questions
            </h2>
            <Link
              href="/faq"
              className="mt-3 inline-block text-sm font-medium uppercase tracking-[0.12em] text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-colors"
            >
              View all FAQs →
            </Link>
          </div>

          <dl className="space-y-3">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-[var(--color-card)] p-3 rounded-xl border border-[var(--color-border)] shadow-sm">
                <dt className="font-[family-name:var(--font-heading)] text-base text-[var(--color-foreground)]">{faq.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
