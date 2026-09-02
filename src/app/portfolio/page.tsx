import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { getPublishedPortfolio } from "@/lib/data/portfolio";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PORTFOLIO_CATEGORIES } from "@/types";
import { Camera, Eye } from "lucide-react";

export const metadata = {
  title: "Portfolio | Glow with Rubi",
  description: "Browse our bridal makeup, reception looks, engagement glamour, and client transformations.",
};

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

const FALLBACK_ITEMS = [
  { id: "1", title: "Classic Royal South Indian Bride", category: "Bridal", date: "June 2026" },
  { id: "2", title: "Glamorous Evening Reception Look", category: "Reception", date: "July 2026" },
  { id: "3", title: "Dewy Pastel Engagement Stylist", category: "Engagement", date: "May 2026" },
  { id: "4", title: "Bold Cut-Crease Party Look", category: "Party", date: "April 2026" },
  { id: "5", title: "Golden hour Maternity Glow", category: "Maternity", date: "March 2026" },
  { id: "6", title: "Intricate Floral Mermaid Braid", category: "Hair", date: "August 2026" },
  { id: "7", title: "Minimalist Pastel Wedding Look", category: "Bridal", date: "June 2026" },
  { id: "8", title: "Modern HD Shimmer Lip", category: "Reception", date: "January 2026" },
];

export default async function PortfolioPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeCategory = params.category;

  const dbItems = await getPublishedPortfolio();
  
  // Use DB items if present, else fallback
  const allItems = dbItems.length > 0 ? dbItems : FALLBACK_ITEMS.map((item, idx) => ({
    id: item.id,
    title: item.title,
    category: item.category as string,
    image_url: null,
    video_url: null,
    is_published: true,
    display_order: idx,
  }));

  const filteredItems = activeCategory
    ? allItems.filter((item) => item.category === activeCategory)
    : allItems;

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-gradient-to-b from-[var(--color-muted)]/20 via-[var(--color-background)] to-[var(--color-muted)]/20 dark:from-[var(--color-muted)]/10 dark:via-[var(--color-background)] dark:to-[var(--color-muted)]/10 pt-24 pb-12 lg:pt-28">
        {/* Header */}
        <section className="container-narrow px-6 text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent)]/80 text-[var(--color-on-accent)] text-xs font-semibold uppercase tracking-wider shadow-lg shadow-[var(--color-accent)]/25">
            <Camera className="w-4 h-4" />
            ARTISTRY ARCHIVE
          </div>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl tracking-tight text-[var(--color-foreground)]">
            Lookbook & Portfolio
          </h1>
          <p className="max-w-xl mx-auto text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            A curated showcase of makeup and hair transformations.
          </p>
        </section>

        {/* Categories Navigation */}
        <section className="container-narrow px-6 mb-8">
          <div className="sticky top-24 z-40 bg-gradient-to-b from-[var(--color-muted)]/20 via-[var(--color-background)] to-[var(--color-muted)]/20 dark:from-[var(--color-muted)]/10 dark:via-[var(--color-background)] dark:to-[var(--color-muted)]/10 backdrop-blur-xl py-4 -mx-6 px-6">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={!activeCategory ? "modern" : "outline"}
                asChild
                className="rounded-full text-xs tracking-wider uppercase"
                size="sm"
              >
                <Link href="/portfolio">All Archive</Link>
              </Button>
              {PORTFOLIO_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "modern" : "outline"}
                  asChild
                  className="rounded-full text-xs tracking-wider uppercase"
                  size="sm"
                >
                  <Link href={`/portfolio?category=${cat}`}>{cat}</Link>
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="container-narrow px-6 mb-12">
          {filteredItems.length === 0 ? (
            <p className="text-center text-sm text-[var(--color-muted-foreground)] py-12">
              No items in this category yet.
            </p>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-[3/4] overflow-hidden rounded-lg sm:rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] cursor-pointer shadow-lg shadow-[var(--color-muted)]/50 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--color-accent)]/10 hover:-translate-y-1"
                >
                  {/* Photo area */}
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title || "Portfolio work"}
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--color-accent)]/10 via-[var(--color-accent)]/5 to-[var(--color-accent)]/15 dark:from-[var(--color-accent)]/20 dark:via-[var(--color-accent)]/10 dark:to-[var(--color-accent)]/25 flex flex-col justify-between p-3 sm:p-4 text-[var(--color-foreground)]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-accent)] border border-[var(--color-accent)]/30 px-2 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--color-accent)] opacity-60" />
                      </div>
                      
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="font-[family-name:var(--font-heading)] text-base sm:text-lg group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                          {item.title}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted-foreground)]">
                          Glow With Rubi
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-center space-y-1 sm:space-y-2 translate-y-2 sm:translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-[var(--color-accent)]" />
                      <p className="text-[10px] sm:text-xs uppercase font-medium tracking-wide text-white">
                        {item.category} Look
                      </p>
                      <Link
                        href="/book"
                        className="text-[10px] uppercase font-bold tracking-widest text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 hover:underline inline-block pt-1"
                      >
                        Request This Styling →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="container-narrow px-6 text-center">
          <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
            Interested in a consultation?
          </p>
          <Button variant="modern" asChild>
            <Link href="/book">
              <Camera className="w-4 h-4 mr-2" />
              Book Consultation
            </Link>
          </Button>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
