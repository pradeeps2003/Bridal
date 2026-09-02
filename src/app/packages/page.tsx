import { PageHero, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { PackageCardSlider } from "@/components/ui/package-card-slider";
import { LazyLoad } from "@/components/ui/lazy-load";
import { JsonLd } from "@/components/seo/json-ld";
import { getActivePackages } from "@/lib/data/packages";
import { getActiveServices } from "@/lib/data/services";
import { getPackageSalePrice } from "@/lib/pricing/calculate";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Packages & Pricing | Glow with Rubi",
  description: "Browse bridal, reception, and occasion makeup packages with clear pricing.",
};

interface PageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function PackagesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeServiceSlug = params.service;

  const [services, allPackages] = await Promise.all([
    getActiveServices(),
    getActivePackages(),
  ]);

  const selectedService = services.find((s) => s.slug === activeServiceSlug);
  const packages = selectedService
    ? allPackages.filter((p) => p.service_id === selectedService.id)
    : allPackages;

  const packagesWithSale = packages.map((pkg) => ({
    ...pkg,
    salePrice: getPackageSalePrice(pkg),
  }));

  return (
    <PageShell>
      <JsonLd />
      <PageHero
        badge="Transparent pricing"
        title="Packages"
        description="Bridal, reception, and occasion looks. Filter by service and book."
      />

      <section className="container-narrow mb-4 sm:mb-6 lg:mb-8 px-3 sm:px-4 lg:px-6">
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
          <Button
            variant={!activeServiceSlug ? "modern" : "outline"}
            asChild
            className="h-8 sm:h-9 lg:h-10 rounded-full text-[10px] sm:text-xs lg:text-sm"
            size="sm"
          >
            <Link href="/packages">All</Link>
          </Button>
          {services.map((s) => (
            <Button
              key={s.id}
              variant={activeServiceSlug === s.slug ? "modern" : "outline"}
              asChild
              className="h-8 sm:h-9 lg:h-10 rounded-full text-[10px] sm:text-xs lg:text-sm"
              size="sm"
            >
              <Link href={`/packages?service=${s.slug}`}>{s.name}</Link>
            </Button>
          ))}
        </div>
      </section>

      <LazyLoad className="container-narrow mb-6 sm:mb-8 lg:mb-12 px-3 sm:px-4 lg:px-6">
        {packages.length === 0 ? (
          <p className="py-8 sm:py-12 text-center text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            No packages in this category yet.
          </p>
        ) : (
          <PackageCardSlider packages={packagesWithSale} />
        )}
      </LazyLoad>

      <LazyLoad className="container-narrow px-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 text-center">
          <Sparkles className="mb-3 h-5 w-5 sm:h-6 sm:w-6 text-[var(--color-accent)]" />
          <h3 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl">Need a custom look?</h3>
          <p className="mt-2 max-w-sm text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            Destination events, extra people, or special timing — contact us for a quote.
          </p>
          <div className="mt-4 sm:mt-5 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button variant="modern" asChild className="h-10 sm:h-11 min-w-36 sm:min-w-40 text-sm">
              <Link href="/contact">Get a quote</Link>
            </Button>
          </div>
        </div>
      </LazyLoad>
    </PageShell>
  );
}
