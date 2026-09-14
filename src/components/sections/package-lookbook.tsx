"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { motion } from "framer-motion";

import { formatCurrency } from "@/lib/utils";
import { getPackageSalePrice } from "@/lib/pricing/calculate";
import type { Package } from "@/types";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
];

function imageFor(pkg: Package, index: number) {
  return pkg.image_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

function LookbookSlide({ pkg, index }: { pkg: Package; index: number }) {
  const sale = getPackageSalePrice(pkg);
  const price =
    pkg.pricing_type === "CUSTOM_QUOTE"
      ? "Quote"
      : formatCurrency(sale ?? pkg.price);

  return (
    <article className="flex h-[420px] w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] sm:h-[460px] sm:w-[280px]">
      <Link href={`/packages/${pkg.slug}`} className="relative block h-[300px] w-full shrink-0 overflow-hidden sm:h-[330px]">
        <Image
          src={imageFor(pkg, index)}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          sizes="280px"
        />
        <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          {pkg.duration_hours}h
        </span>
      </Link>
      <div className="flex h-[120px] shrink-0 flex-col justify-between p-4">
        <div>
          <h3 className="line-clamp-1 font-[family-name:var(--font-heading)] text-lg leading-tight text-[var(--color-foreground)]">
            {pkg.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-[var(--color-muted-foreground)]">
            {pkg.description || "Signature look"}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="font-numeric text-sm font-semibold text-[var(--color-accent)]">{price}</p>
          <Link
            href={`/book?package=${pkg.slug}`}
            className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-foreground)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
          >
            Book
          </Link>
        </div>
      </div>
    </article>
  );
}

export function PackageLookbook({ packages }: { packages: Package[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [packages]);

  const scrollByCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (!packages.length) return null;

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="hide-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1"
      >
        {packages.map((pkg, index) => (
          <LookbookSlide key={pkg.id} pkg={pkg} index={index} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
          <Clock className="mr-1 inline h-3 w-3" aria-hidden="true" />
          Slide to browse looks
        </p>
        <div className="flex gap-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            disabled={!canPrev}
            onClick={() => scrollByCard(-1)}
            aria-label="Previous look"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            disabled={!canNext}
            onClick={() => scrollByCard(1)}
            aria-label="Next look"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
