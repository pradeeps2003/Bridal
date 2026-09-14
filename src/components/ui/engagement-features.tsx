"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Copy, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Mail,
  Check,
  X,
  Heart,
  Bookmark,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Social share component
interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  onOpenChange?: (open: boolean) => void;
}

export function SocialShare({ 
  url, 
  title, 
  description,
  onOpenChange 
}: SocialShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description || ""} ${url}`)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, "_blank", "width=600,height=400");
    }
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          setIsOpen(!isOpen);
          onOpenChange?.(!isOpen);
        }}
        className="h-9 w-9 rounded-full"
      >
        <Share2 className="h-4 w-4" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false);
                onOpenChange?.(false);
              }}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-2xl"
            >
              <div className="mb-3">
                <p className="text-sm font-semibold text-[var(--color-foreground)]">Share this look</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">Spread the glow</p>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => handleShare("facebook")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare("twitter")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">Instagram</span>
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare("email")}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-muted)] transition-colors"
                >
                  <Mail className="h-5 w-5 text-gray-600" />
                  <span className="text-[10px] text-[var(--color-muted-foreground)]">Email</span>
                </button>
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-muted)] transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-[var(--color-foreground)]">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[var(--color-muted-foreground)]" />
                    <span className="text-sm text-[var(--color-foreground)]">Copy link</span>
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick action bar
interface QuickActionBarProps {
  onLike?: () => void;
  onBookmark?: () => void;
  onShare?: () => void;
  onBook?: () => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
  showBookButton?: boolean;
}

export function QuickActionBar({
  onLike,
  onBookmark,
  onShare,
  onBook,
  isLiked = false,
  isBookmarked = false,
  showBookButton = true
}: QuickActionBarProps) {
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onLike}
        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
          isLiked 
            ? "bg-red-50 text-red-500" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onBookmark}
        className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
          isBookmarked 
            ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]" 
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onShare}
        className="h-10 w-10 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        <Share2 className="h-5 w-5" />
      </motion.button>

      {showBookButton && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1"
        >
          <Button
            onClick={onBook}
            size="sm"
            className="w-full h-10 bg-[var(--color-button)] text-[var(--color-on-button)] hover:bg-[var(--color-button)]/90"
          >
            Book Now
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// Filter chips for content filtering
interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  count?: number;
}

export function FilterChip({ label, isActive = false, onClick, count }: FilterChipProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
        ${isActive 
          ? "bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-md" 
          : "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80"
        }
      `}
    >
      {label}
      {count !== undefined && (
        <span className={`text-xs ${isActive ? "text-[var(--color-on-accent)]/80" : "text-[var(--color-muted-foreground)]"}`}>
          {count}
        </span>
      )}
    </motion.button>
  );
}

// Search with live results
interface LiveSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  results?: Array<{ id: string; title: string; subtitle?: string }>;
  onResultClick?: (id: string) => void;
}

export function LiveSearch({ 
  placeholder = "Search looks...", 
  onSearch,
  results = [],
  onResultClick 
}: LiveSearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredResults = results.filter(result =>
    result.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
    setIsOpen(value.length > 0);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-muted-foreground)]" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)]"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              onSearch?.("");
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl overflow-hidden z-50"
          >
            {filteredResults.map((result) => (
              <button
                key={result.id}
                onClick={() => {
                  onResultClick?.(result.id);
                  setIsOpen(false);
                  setQuery(result.title);
                }}
                className="w-full px-4 py-3 text-left hover:bg-[var(--color-muted)] transition-colors flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">{result.title}</p>
                  {result.subtitle && (
                    <p className="text-xs text-[var(--color-muted-foreground)]">{result.subtitle}</p>
                  )}
                </div>
                <ArrowUpRight className="h-4 w-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--color-accent)] transition-colors" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Trending/Popular badges
interface TrendingBadgeProps {
  children: ReactNode;
  variant?: "hot" | "new" | "popular";
}

export function TrendingBadge({ children, variant = "hot" }: TrendingBadgeProps) {
  const variants = {
    hot: "bg-gradient-to-r from-orange-500 to-red-500",
    new: "bg-gradient-to-r from-green-500 to-emerald-500",
    popular: "bg-gradient-to-r from-purple-500 to-pink-500"
  };

  const icons = {
    hot: <Zap className="h-3 w-3" />,
    new: <span className="text-[10px] font-bold">NEW</span>,
    popular: <Heart className="h-3 w-3" />
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${variants[variant]}`}
    >
      {icons[variant]}
      {children}
    </motion.div>
  );
}

// Download/save for offline
interface DownloadButtonProps {
  onDownload?: () => void;
  isDownloaded?: boolean;
  label?: string;
}

export function DownloadButton({ 
  onDownload, 
  isDownloaded = false,
  label = "Save" 
}: DownloadButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onDownload}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
        ${isDownloaded 
          ? "bg-green-100 text-green-700" 
          : "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[var(--color-muted)]/80"
        }
      `}
    >
      {isDownloaded ? (
        <>
          <Check className="h-4 w-4" />
          Saved
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          {label}
        </>
      )}
    </motion.button>
  );
}
