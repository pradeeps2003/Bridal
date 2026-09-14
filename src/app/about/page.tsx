import { AppImage } from "@/components/ui/app-image";
import { Award, Heart, ShieldCheck } from "lucide-react";

import { PageHero, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { ScrollAnimate, StaggerContainer } from "@/components/ui/scroll-animate";
import { getAboutSettings } from "@/lib/data/settings";
import Link from "next/link";

export const revalidate = 300; // Cache for 5 minutes

export const metadata = {
  title: "About Rubi",
  description:
    "Meet Nithiya Rubini of Glow with Rubi (Rubi Makeovers) — skin-first HD bridal makeup artist in Pollachi, travelling to Coimbatore and Tamil Nadu.",
  keywords: ["Nithiya Rubini", "Rubi Makeovers Pollachi", "bridal makeup artist Pollachi"],
};

const PILLAR_ICONS = [ShieldCheck, Award, Heart] as const;

export default async function AboutPage() {
  const about = await getAboutSettings();

  return (
    <PageShell>
      <PageHero badge={about.badge} title={about.title} description={about.description} withBlobs />

      <ScrollAnimate animation="fade-up" delay={0.2}>
        <section className="container-narrow mb-12 grid items-stretch gap-6 px-6 lg:grid-cols-2">
          <div className="relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)] p-6">
            <AppImage
              src={about.artist_image_url || "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80"}
              alt={about.artist_name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="relative z-10 text-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">{about.artist_label}</p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl">{about.artist_name}</p>
              <p className="mt-3 max-w-sm text-sm text-white/80">{about.artist_statement}</p>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{about.body}</p>
            <Button variant="modern" asChild className="h-11 w-full sm:w-auto"><Link href="/book">Book Your Date</Link></Button>
          </div>
        </section>
      </ScrollAnimate>

      <StaggerContainer staggerDelay={0.15} animation="scale-up" className="container-narrow mb-12 px-6">
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {about.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? Heart;
            return <div key={`${pillar.title}-${index}`} className="equal-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5"><Icon className="h-5 w-5 text-[var(--color-accent)]" aria-hidden="true" /><h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg">{pillar.title}</h3><p className="mt-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{pillar.copy}</p></div>;
          })}
        </div>
      </StaggerContainer>
    </PageShell>
  );
}
