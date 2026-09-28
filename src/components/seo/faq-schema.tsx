/**
 * FAQ Page structured data (JSON-LD) for Google rich snippets.
 * Renders FAQPage schema so Google can display Q&A directly in search results.
 */

interface FAQItem {
  q: string;
  a: string;
}

interface FAQSection {
  title: string;
  items: FAQItem[];
}

interface Props {
  sections: FAQSection[];
}

export function FaqSchema({ sections }: Props) {
  const allItems = sections.flatMap((s) => s.items);

  if (allItems.length === 0) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allItems.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
