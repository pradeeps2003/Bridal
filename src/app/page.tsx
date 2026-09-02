import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  FaqPreviewSection,
  FeaturedPackagesSection,
  HeroSection,
  TestimonialsSection,
} from "@/components/sections/home-sections";
import { getActivePackages } from "@/lib/data/packages";
import { getPublishedTestimonials } from "@/lib/data/testimonials";
import { QuickStartGuide } from "@/components/onboarding/quick-start-guide";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bridalPackages, testimonials] = await Promise.all([
    getActivePackages({ serviceSlug: "bridal", limit: 3 }),
    getPublishedTestimonials(),
  ]);

  const formattedTestimonials = testimonials.length > 0 
    ? testimonials.map(t => ({
        quote: t.quote,
        name: t.full_name,
        event: t.event_type || "Client",
      }))
    : undefined;

  return (
    <>
      <SiteHeader />
      <QuickStartGuide />
      <main className="bg-[var(--color-background)]">
        <HeroSection />
        <FeaturedPackagesSection packages={bridalPackages} />
        <TestimonialsSection testimonials={formattedTestimonials} />
        <FaqPreviewSection />
      </main>
      <SiteFooter />
    </>
  );
}
