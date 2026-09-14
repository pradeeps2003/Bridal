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
  const [allPackages, testimonials, siteSettings] = await Promise.all([
    getActivePackages({ limit: 100 }), // Get all packages
    getPublishedTestimonials(),
    getSiteSettings(),
  ]);

  // Get featured package IDs from settings (admin control)
  const featuredIds = siteSettings.featured_package_ids ?? [];
  
  // If admin selected specific packages, use those; otherwise show one per service
  let bridalPackages: typeof allPackages;
  if (featuredIds.length > 0) {
    bridalPackages = allPackages.filter(pkg => featuredIds.includes(pkg.id)).slice(0, 8);
  } else {
    // Default: one from each service type
    const byService = new Map<string | null, typeof allPackages[0]>();
    allPackages.forEach(pkg => {
      const service = pkg.services?.[0]?.slug ?? null;
      if (!byService.has(service)) {
        byService.set(service, pkg);
      }
    });
    bridalPackages = Array.from(byService.values()).slice(0, 6);
  }

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
