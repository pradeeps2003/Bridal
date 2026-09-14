import { PageHero, PageShell } from "@/components/layout/page-shell";
import { ContactForm } from "@/components/sections/contact-form";
import { ScrollAnimate } from "@/components/ui/scroll-animate";

export const metadata = {
  title: "Contact",
  description:
    "WhatsApp Glow with Rubi for bridal makeup in Pollachi, Coimbatore, Tiruppur, and Tamil Nadu. Home service and venue bookings.",
  keywords: ["makeup artist Pollachi WhatsApp", "contact bridal makeup Coimbatore"],
};

export default async function ContactPage() {
  return (
    <PageShell>
      <PageHero
        badge="Questions only"
        title="Ask about extras"
        description="Questions about extras, travel across Tamil Nadu, or a Pollachi / Coimbatore date. Book separately."
        withBlobs
      />

      <ScrollAnimate animation="scale-up" delay={0.2}>
        <section className="container-narrow px-6 lg:max-w-2xl">
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl">Ask a question</h2>
            <div className="mt-4">
              <ContactForm />
            </div>
          </div>
        </section>
      </ScrollAnimate>
    </PageShell>
  );
}
