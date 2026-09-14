import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export const AUTH_IMAGES = {
  login:
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1600&q=80",
  signup:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  admin:
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80",
  reset:
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1600&q=80",
} as const;

export function AuthSplitScreen({
  title,
  description,
  children,
  footer,
  imageSrc,
  imageAlt,
  imageKicker = "Glow with Rubi",
  imageQuote = "Bridal HD from Pollachi, across Coimbatore and Tamil Nadu.",
  headerRight,
  className,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  imageKicker?: string;
  imageQuote?: string;
  headerRight?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid min-h-svh bg-[var(--color-background)] lg:grid-cols-2", className)}>
      <div className="relative isolate flex flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-accent)]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="font-[family-name:var(--font-heading)] text-xl text-[var(--color-foreground)]">
              Glow with Rubi
            </span>
          </Link>
          {headerRight}
        </div>

        <div className="relative h-44 overflow-hidden sm:h-56 lg:hidden">
          <AuthPanelImage src={imageSrc} alt={imageAlt} />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10 sm:px-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            {imageKicker}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-4xl leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">{description}</p>
          <div className="mt-8">{children}</div>
          {footer}
        </div>
      </div>

      <div className="relative hidden min-h-svh overflow-hidden lg:block">
        <AuthPanelImage src={imageSrc} alt={imageAlt} priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
            {imageKicker}
          </p>
          <p className="mt-3 max-w-md font-[family-name:var(--font-heading)] text-3xl italic leading-snug">
            {imageQuote}
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthPanelImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      quality={70}
      sizes="(max-width: 1024px) 100vw, 50vw"
      className="object-cover"
    />
  );
}
