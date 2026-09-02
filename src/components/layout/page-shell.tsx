import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-background)] pb-16 pt-20 sm:pt-24 lg:pt-28 w-full overflow-x-hidden">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}

export function PageHero({
  badge,
  title,
  description,
}: {
  badge: string;
  title: string;
  description: string;
}) {
  return (
    <section className="container-narrow mb-6 sm:mb-10 px-4 sm:px-6 text-center w-full">
      <p className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[var(--color-accent)]">
        {badge}
      </p>
      <h1 className="mt-3 sm:mt-4 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl tracking-tight text-[var(--color-foreground)] sm:text-5xl">
        {title}
      </h1>
      <p className="mx-auto mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-[var(--color-muted-foreground)]">
        {description}
      </p>
    </section>
  );
}
