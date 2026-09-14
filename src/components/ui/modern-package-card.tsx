"use client";

import { AppImage } from "@/components/ui/app-image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { Package } from "@/types";
import { 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Heart, 
  Bookmark, 
  Share2, 
  Eye,
  MoreVertical,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModernPackageCardProps {
  pkg: Package;
  showSaleBadge?: boolean;
  salePrice?: number;
  inclusionsPreview?: number;
  onBookmark?: (id: string) => void;
  onShare?: (pkg: Package) => void;
  isBookmarked?: boolean;
}

const DUMMY_BRIDAL_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=600&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
];

function imageForPackage(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash + id.charCodeAt(i)) % DUMMY_BRIDAL_IMAGES.length;
  return DUMMY_BRIDAL_IMAGES[hash];
}

export function ModernPackageCard({ 
  pkg, 
  showSaleBadge = false, 
  salePrice, 
  inclusionsPreview = 2,
  onBookmark,
  onShare,
  isBookmarked = false
}: ModernPackageCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const imageUrl = pkg.image_url || imageForPackage(pkg.id);
  const hasSale = showSaleBadge && salePrice !== undefined && salePrice < pkg.price;
  const displayInclusions = pkg.inclusions?.slice(0, inclusionsPreview) || [];

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLiked(!isLiked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    onBookmark?.(pkg.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    onShare?.(pkg);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setShowOverlay(true)}
      onHoverEnd={() => setShowOverlay(false)}
      className="group relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-accent)]/30 hover:shadow-2xl"
    >
      {hasSale && (
        <Badge className="absolute right-3 top-3 z-20 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 px-3 py-1 text-xs font-semibold text-[var(--color-on-accent)] rounded-full shadow-lg">
          Sale
        </Badge>
      )}

      {/* Image Container with Pinterest-style overlay */}
      <div className="relative h-56 overflow-hidden bg-[var(--color-muted)] sm:h-60">
        <Link href={`/packages/${pkg.slug}`} className="absolute inset-0 z-10" aria-label={`View ${pkg.name}`}>
          <span className="sr-only">View {pkg.name}</span>
        </Link>
        <AppImage
          src={imageUrl}
          alt={`${pkg.name} bridal makeup`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Pinterest-style overlay actions */}
        <AnimatePresence>
          {showOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="absolute top-3 right-3 flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBookmark}
                  className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Bookmark 
                    className={`h-4 w-4 ${isBookmarked ? 'fill-[var(--color-accent)] text-[var(--color-accent)]' : 'text-gray-700'}`} 
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShare}
                  className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                >
                  <Share2 className="h-4 w-4 text-gray-700" />
                </motion.button>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button 
                    variant="modern" 
                    size="sm" 
                    asChild 
                    className="w-full h-10 bg-white/90 backdrop-blur-sm text-[var(--color-button)] hover:bg-white shadow-lg"
                  >
                    <Link href={`/book?package=${pkg.slug}`}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Book Now
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick action buttons always visible */}
        <div className="absolute bottom-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLike}
            className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors"
          >
            <Heart 
              className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} 
            />
          </motion.button>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold leading-tight text-[var(--color-foreground)] line-clamp-2">
            {pkg.name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] shrink-0">
            <Clock className="h-3 w-3 text-[var(--color-accent)]" />
            {pkg.duration_hours}h
          </div>
        </div>

        <p className="min-h-12 text-sm leading-relaxed text-[var(--color-muted-foreground)] line-clamp-2 mb-3">
          {pkg.description}
        </p>

        <ul className="flex-1 space-y-1.5 mb-3">
          {displayInclusions.map((inclusion) => (
            <li key={inclusion} className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-[var(--color-accent)]" />
              <span className="line-clamp-1">{inclusion}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--color-border)]">
          <div className="flex flex-col">
            <p className="font-[family-name:var(--font-body)] text-xl font-bold text-[var(--color-accent)] tracking-tight">
              {hasSale ? formatCurrency(salePrice) : pkg.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(pkg.price)}
            </p>
            {hasSale && (
              <p className="text-xs text-[var(--color-muted-foreground)] line-through">
                {formatCurrency(pkg.price)}
              </p>
            )}
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              asChild 
              className="h-8 px-3 text-xs font-medium text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
            >
              <Link href={`/packages/${pkg.slug}`} className="flex items-center gap-1">
                Details <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.article>
  );
}
