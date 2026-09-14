"use client";

import { AppImage } from "@/components/ui/app-image";
import Link from "next/link";
import { ArrowUpRight, Sparkles, type LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getPackageSalePrice } from "@/lib/pricing/calculate";
import type { Package } from "@/types";

export type Service = {
  number: string;
  title: string;
  description: string;
  href?: string;
  imageUrl?: string;
  icon?: LucideIcon;
  gradient?: string;
  meta?: string;
};

const FALLBACKS = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=900&q=80",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=900&q=80",
  "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=900&q=80",
];

export function packagesToServices(packages: Package[]): Service[] {
  return packages.map((pkg, index) => {
    const sale = getPackageSalePrice(pkg);
    const price =
      pkg.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(sale ?? pkg.price);
    return {
      number: String(index + 1).padStart(3, "0"),
      title: pkg.name,
      description: pkg.description || "Signature bridal look",
      href: `/packages/${pkg.slug}`,
      imageUrl: pkg.image_url || FALLBACKS[index % FALLBACKS.length],
      icon: Sparkles,
      meta: `${price} · ${pkg.duration_hours}h`,
      gradient: "from-[hsl(345_40%_12%)] to-[hsl(345_35%_22%)]",
    };
  });
}

export function ServiceCarousel({ services }: { services: Service[] }) {
  if (!services.length) return null;

  return (
    <div className="flex w-full flex-col gap-3 lg:h-[28rem] lg:flex-row">
      {services.map((service) => {
        const Icon = service.icon ?? Sparkles;
        return (
          <Link
            key={service.number}
            href={service.href || "/packages"}
            className="group relative flex min-h-[14rem] flex-1 overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] transition-[flex] duration-500 ease-out lg:min-h-0 lg:hover:flex-[1.65]"
          >
            {service.imageUrl ? (
              <AppImage
                src={service.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient ?? "from-[var(--color-muted)] to-[var(--color-card)]"}`} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
            <div className="relative z-10 flex h-full w-full flex-col justify-between p-5 text-white sm:p-6">
              <div className="flex items-start justify-between">
                <span className="font-numeric text-xs tracking-[0.2em] text-white/70">{service.number}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl leading-tight sm:text-3xl">
                  {service.title}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-white/80 opacity-90 lg:max-h-0 lg:overflow-hidden lg:opacity-0 lg:transition-all lg:duration-400 lg:group-hover:max-h-24 lg:group-hover:opacity-100">
                  {service.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                  <span>{service.meta}</span>
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
