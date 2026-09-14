import { PageHero, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <PageShell>
      <PageHero
        badge="404 Error"
        title="Page Not Found"
        description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
      />
      
      <section className="container-narrow px-6 lg:max-w-2xl py-12 flex flex-col justify-center items-center text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl mb-4 text-[var(--color-foreground)]">
          Looks like you&apos;re lost
        </h2>
        <p className="text-[var(--color-muted-foreground)] mb-8 max-w-md">
          Don&apos;t worry, even the best makeup artists sometimes take a wrong turn. Let&apos;s get you back to finding the perfect look.
        </p>
        <Button variant="modern" asChild className="h-11">
          <Link href="/">Back to Homepage</Link>
        </Button>
      </section>
    </PageShell>
  );
}
