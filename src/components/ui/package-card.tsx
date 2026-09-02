"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Package } from "@/types";
import { CheckCircle2, Clock, Sparkles, Tag } from "lucide-react";
import { motion } from "framer-motion";

interface PackageCardProps {
  pkg: Package;
  showSaleBadge?: boolean;
  salePrice?: number;
  inclusionsPreview?: number;
}

const DUMMY_BRIDAL_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80",
];

function imageForPackage(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % DUMMY_BRIDAL_IMAGES.length;
  return DUMMY_BRIDAL_IMAGES[hash];
}

export function PackageCard({ pkg, showSaleBadge = false, salePrice, inclusionsPreview = 2 }: PackageCardProps) {
  const imageUrl = pkg.image_url || imageForPackage(pkg.id);
  const hasSale = showSaleBadge && salePrice !== undefined && salePrice < pkg.price;
  const displayInclusions = pkg.inclusions?.slice(0, inclusionsPreview) || [];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group equal-card relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-300 hover:shadow-xl hover:border-[var(--color-accent)]/50"
    >
      {hasSale && (
        <Badge className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
          Sale
        </Badge>
      )}

      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-muted)]">
        <Image
          src={imageUrl}
          alt={`${pkg.name} bridal makeup`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="lazy"
        />
      </div>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-[family-name:var(--font-heading)] text-xs sm:text-sm md:text-base font-semibold leading-tight text-[var(--color-foreground)]">
            {pkg.name}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-[var(--color-muted-foreground)] shrink-0">
            <span className="flex items-center gap-0.5">
              <Clock className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-[var(--color-accent)]" />
              {pkg.duration_hours}h
            </span>
          </div>
        </div>

        <p className="mt-1 min-h-5 text-[9px] sm:text-[10px] md:text-[11px] leading-relaxed text-[var(--color-muted-foreground)] line-clamp-2">
          {pkg.description}
        </p>

        <ul className="mt-1.5 sm:mt-2 min-h-[2rem] sm:min-h-[2.5rem] space-y-0.5 sm:space-y-1">
          {displayInclusions.map((inclusion) => (
            <li key={inclusion} className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] md:text-[11px] text-[var(--color-muted-foreground)]">
              <CheckCircle2 className="h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 shrink-0 text-[var(--color-accent)]" />
              <span className="line-clamp-1">{inclusion}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5 sm:pt-2 md:pt-3 border-t border-[var(--color-border)]">
          <div className="flex flex-col">
            <p className="font-[family-name:var(--font-body)] text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-accent)] tracking-tight">
              {hasSale ? formatCurrency(salePrice) : pkg.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(pkg.price)}
            </p>
            {hasSale && (
              <p className="text-[10px] sm:text-xs md:text-sm text-[var(--color-muted-foreground)] line-through">
                {formatCurrency(pkg.price)}
              </p>
            )}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="modern" size="sm" asChild className="h-6 sm:h-7 md:h-8 px-1.5 sm:px-2 md:px-3 text-[9px] sm:text-[10px] md:text-xs">
              <Link href={`/book?package=${pkg.slug}`}>
                <Sparkles className="mr-0.5 sm:mr-1 h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5" />
                Book
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
