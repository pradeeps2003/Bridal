import { PageHero, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import Link from "next/link";

export const revalidate = 300; // Cache for 5 minutes

export const metadata = {
  title: "FAQ",
  description:
    "Bridal makeup booking, home service travel in Tamil Nadu, cancellation, and HD products — Glow with Rubi in Pollachi and Coimbatore.",
  keywords: ["bridal makeup FAQ Pollachi", "home service makeup Tamil Nadu"],
};

const FAQ_SECTIONS = [
  {
    title: "Booking",
    items: [
      {
        q: "How far ahead should I book?",
        a: "3 to 6 months for wedding season. Last-minute dates sometimes open on the booking calendar.",
      },
      {
        q: "What is a hold?",
        a: "We lock your slot for a short window while the request is reviewed. After approval, pay the advance to confirm.",
      },
    ],
  },
  {
    title: "Cancellation",
    items: [
      {
        q: "Can I cancel?",
        a: "Yes, from your booking confirmation page or account. If you have not paid an advance, the date is released. If you have paid, the studio decides any refund.",
      },
      {
        q: "Do I get the advance back?",
        a: "The studio reviews each case. If the event is less than 7 days away, the advance is not returned unless they choose to help. Refunds, when approved, are sent back on UPI.",
      },
      {
        q: "When is the rest of the money paid?",
        a: "On the event day, in person. The studio gets a reminder that day to collect the remaining balance.",
      },
    ],
  },
  {
    title: "Travel",
    items: [
      {
        q: "Do you come to the venue?",
        a: "Yes. Full hair and makeup setup at home, hotel, or hall in Pollachi, Coimbatore, and across Tamil Nadu. Travel is shown before you confirm.",
      },
    ],
  },
  {
    title: "Products",
    items: [
      {
        q: "What makeup do you use?",
        a: "Premium, skin-safe formulas chosen for long wear and photography, with tools sanitized between clients.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <PageShell>
      <PageHero
        badge="Help"
        title="Common questions"
        description="Short answers on dates, travel, and how booking works."
      />

      <ScrollAnimate animation="fade-up" delay={0.2} className="container-narrow mb-8 sm:mb-12 max-w-3xl px-4 sm:px-6">
        <FAQAccordion sections={FAQ_SECTIONS} />
      </ScrollAnimate>

      <ScrollAnimate animation="scale-up" delay={0.3} className="container-narrow px-4 sm:px-6">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6 text-center">
          <h3 className="font-[family-name:var(--font-heading)] text-lg sm:text-xl">Still need help?</h3>
          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button variant="modern" asChild className="h-10 sm:h-11 min-w-32 sm:min-w-36 text-sm">
              <Link href="/contact">Message us</Link>
            </Button>
            <Button variant="outline" asChild className="h-10 sm:h-11 min-w-32 sm:min-w-36 text-sm">
              <Link href="/book">Check dates</Link>
            </Button>
          </div>
        </div>
      </ScrollAnimate>
    </PageShell>
  );
}
