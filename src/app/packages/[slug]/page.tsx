import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, Sparkles } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import { getActivePackages, getPackageBySlug } from "@/lib/data/packages";
import { SEED_PACKAGES } from "@/lib/data/seed";
import { getPackageSalePrice } from "@/lib/pricing/calculate";
import { formatCurrency } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SEED_PACKAGES.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) {
    return { title: "Package | Glow with Rubi" };
  }
  return {
    title: `${pkg.name} | Glow with Rubi`,
    description: pkg.description || `Book the ${pkg.name} makeup package.`,
  };
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80";

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const salePrice = getPackageSalePrice(pkg);
  const hasSale = salePrice !== null && salePrice < pkg.price;
  const priceLabel =
    pkg.pricing_type === "CUSTOM_QUOTE"
      ? "Custom quote"
      : formatCurrency(hasSale ? salePrice : pkg.price);
  const related = (await getActivePackages({ limit: 8 }))
    .filter((item) => item.slug !== pkg.slug)
    .slice(0, 3);

  return (
    <PageShell>
      <ScrollAnimate animation="fade-up">
        <section className="container-narrow mb-10 px-4 sm:px-6">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            <Link href="/packages" className="hover:underline">
              Packages
            </Link>
            <span className="mx-2 text-[var(--color-muted-foreground)]">/</span>
            {pkg.name}
          </p>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <div className="relative min-h-[22rem] overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-muted)] sm:min-h-[28rem]">
              <Image
                src={pkg.image_url || FALLBACK_IMAGE}
                alt={pkg.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            <div className="flex flex-col">
              <p className="inline-flex w-fit items-center rounded-full border border-[var(--color-accent)]/40 bg-[var(--color-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
                Signature look
              </p>
              <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl tracking-tight text-[var(--color-foreground)] sm:text-5xl">
                {pkg.name}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {pkg.description}
              </p>

              <div className="mt-6 flex flex-wrap items-end gap-4">
                <div>
                  <p className="font-[family-name:var(--font-body)] text-3xl font-bold text-[var(--color-accent)]">
                    {priceLabel}
                  </p>
                  {hasSale ? (
                    <p className="text-sm text-[var(--color-muted-foreground)] line-through">
                      {formatCurrency(pkg.price)}
                    </p>
                  ) : pkg.pricing_type === "STARTING_FROM" ? (
                    <p className="text-xs text-[var(--color-muted-foreground)]">Starting from</p>
                  ) : null}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)]">
                  <Clock className="h-4 w-4 text-[var(--color-accent)]" aria-hidden="true" />
                  {pkg.duration_hours} hours
                </p>
              </div>

              {pkg.inclusions?.length ? (
                <ul className="mt-6 space-y-2">
                  {pkg.inclusions.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-foreground)]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button variant="modern" asChild className="h-11 min-w-40">
                  <Link href={`/book?package=${pkg.slug}`}>
                    <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                    Book this look
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-11 min-w-40">
                  <Link href="/packages">All packages</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </ScrollAnimate>

      {related.length > 0 ? (
        <section className="container-narrow px-4 sm:px-6">
          <h2 className="mb-4 font-[family-name:var(--font-heading)] text-2xl">Other looks</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.id}
                href={`/packages/${item.slug}`}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 transition-colors hover:border-[var(--color-accent)]/40"
              >
                <p className="font-[family-name:var(--font-heading)] text-lg">{item.name}</p>
                <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted-foreground)]">{item.description}</p>
                <p className="mt-3 text-sm font-semibold text-[var(--color-accent)]">
                  {item.pricing_type === "CUSTOM_QUOTE" ? "Quote" : formatCurrency(item.price)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
