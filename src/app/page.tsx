import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  FaqPreviewSection,
  FeaturedPackagesSection,
  HeroSection,
  TestimonialsSection,
} from "@/components/sections/home-sections";
import { getActivePackages } from "@/lib/data/packages";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublishedTestimonials } from "@/lib/data/testimonials";

export const revalidate = 300; // Cache for 5 minutes

export default async function HomePage() {
  const [bridalPackages, testimonials, siteSettings] = await Promise.all([
    getActivePackages({ serviceSlug: "bridal", limit: 4 }),
    getPublishedTestimonials(),
    getSiteSettings(),
  ]);

  const formattedTestimonials = testimonials.length > 0
    ? testimonials.map((t) => ({
        quote: t.quote,
        name: t.full_name,
        event: t.event_type || "Client",
        rating: t.rating || 5,
      }))
    : undefined;

  return (
    <>
      <SiteHeader />
      <main className="bg-[var(--color-background)]">
        <HeroSection imageUrls={siteSettings.hero_image_urls} />
        <FeaturedPackagesSection packages={bridalPackages} />
        <TestimonialsSection testimonials={formattedTestimonials} />
        <FaqPreviewSection />
      </main>
      <SiteFooter />
    </>
  );
}
