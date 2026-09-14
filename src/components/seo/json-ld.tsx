import { getSiteSettings } from "@/lib/data/settings";
import { getSiteUrl } from "@/lib/seo/site-url";
import {
  SEO_DESCRIPTION,
  SEO_SERVICES,
  SERVICE_REGION,
  SERVICE_TOWNS,
} from "@/lib/seo/service-area";

export async function JsonLd() {
  const settings = await getSiteSettings();
  const siteUrl = getSiteUrl();
  const instagram = settings.instagram
    ? `https://instagram.com/${settings.instagram.replace(/^@/, "")}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MakeupArtist",
    "@id": `${siteUrl}/#artist`,
    name: settings.business_name || "Glow with Rubi",
    alternateName: ["Rubi Makeovers", "Nithiya Rubini", "Glow with Rubi Pollachi"],
    description: SEO_DESCRIPTION,
    url: siteUrl,
    telephone: settings.phone,
    email: settings.email || undefined,
    image: `${siteUrl}/og-image.jpg`,
    sameAs: instagram ? [instagram] : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address || "Vettaikaranpudur",
      addressLocality: "Pollachi",
      addressRegion: SERVICE_REGION,
      postalCode: "642129",
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.658,
      longitude: 77.008,
    },
    areaServed: [
      ...SERVICE_TOWNS.map((name) => ({ "@type": "City", name })),
      { "@type": "State", name: SERVICE_REGION },
    ],
    knowsAbout: SEO_SERVICES,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Makeup packages",
      itemListElement: SEO_SERVICES.map((name) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name, areaServed: SERVICE_REGION },
      })),
    },
    priceRange: "₹₹₹",
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "09:00",
        closes: "20:00",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
