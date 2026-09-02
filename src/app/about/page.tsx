import { PageHero, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Award, Heart, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About Rubi | Glow with Rubi",
  description: "Skin-first bridal makeup artistry with eight years of luxury occasion experience.",
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Skin inclusivity",
    copy: "Custom blends for every tone and texture. No ashiness, no oxidation.",
  },
  {
    icon: Award,
    title: "Certified training",
    copy: "HD and airbrush techniques, built for ceremony light and evening photos.",
  },
  {
    icon: Heart,
    title: "Calm presence",
    copy: "A grounded dressing-room energy so the morning stays serene.",
  },
];

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        badge="The artist"
        title="Timeless artistry, intentionally crafted"
        description="Rubi Sen specializes in skin-first bridal makeup that photographs beautifully."
      />

      <section className="container-narrow mb-12 grid items-stretch gap-6 px-6 lg:grid-cols-2">
        <div className="flex min-h-[22rem] flex-col justify-end rounded-2xl border border-[var(--color-border)] bg-[var(--color-muted)] p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-accent)]">Meet the artist</p>
          <p className="mt-2 font-[family-name:var(--font-heading)] text-3xl">Nithiya Rubini</p>
          <p className="mt-3 max-w-sm text-sm text-[var(--color-muted-foreground)]">
            Makeup is not a mask. It is a refinement of light, texture, and character.
          </p>
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            With over three years in luxury bridal work, We're known for our skin-first approach to bridal makeup. We focus on colour correction and light placement. Looks are built around wardrobe, jewellery, and venue lighting.
          </p>
          <Button variant="modern" asChild className="h-11 w-full sm:w-auto">
            <Link href="/book">Book Your Date</Link>
          </Button>
        </div>
      </section>

      <section className="container-narrow mb-12 px-6">
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          {pillars.map((item) => (
            <div key={item.title} className="equal-card rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
              <item.icon className="h-5 w-5 text-[var(--color-accent)]" />
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-lg">{item.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-[var(--color-muted-foreground)]">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
