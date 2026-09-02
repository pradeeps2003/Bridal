import { PageHero, PageShell } from "@/components/layout/page-shell";
import { ContactForm } from "@/components/sections/contact-form";

export const metadata = {
  title: "Contact Us | Glow with Rubi",
  description: "WhatsApp, call, or send a message for custom makeup bookings.",
};

export default async function ContactPage() {
  return (
    <PageShell>
      <PageHero
        badge="Questions only"
        title="Ask about extras"
        description="Use this page for Doubts. Book your makeup date separately."
      />

      <section className="container-narrow px-6 lg:max-w-2xl">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl">Ask a question</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
