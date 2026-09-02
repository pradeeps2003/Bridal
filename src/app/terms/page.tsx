import { PageShell } from "@/components/layout/page-shell";

export const metadata = {
  title: "Terms of Service | Glow with Rubi",
  description: "Terms and conditions for using Glow with Rubi bridal makeup services.",
};

export default function TermsOfServicePage() {
  return (
    <PageShell>
      <div className="container-narrow section-padding">
        <div className="max-w-3xl">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold mb-6">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)] mb-8">
            Last updated: August 30, 2026
          </p>

          <div className="prose prose-sm max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Agreement to Terms</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                By accessing or using Glow with Rubi&apos;s services and website, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Services Description</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-4">
                Glow with Rubi provides professional bridal and occasion makeup services including:
              </p>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Bridal makeup packages</li>
                <li>Reception and event makeup</li>
                <li>Home and studio services</li>
                <li>Makeup consultations</li>
                <li>Related beauty services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Booking and Payment Terms</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Booking Process</h3>
                  <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
                    <li>Bookings are confirmed upon payment of advance amount</li>
                    <li>Time slots are held for a specified duration pending payment</li>
                    <li>All bookings are subject to availability</li>
                    <li>Prices quoted are inclusive of agreed services</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment Terms</h3>
                  <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
                    <li>Advance payment required to confirm booking</li>
                    <li>Balance payment due before or on service date</li>
                    <li>Payment methods include UPI, bank transfer, and online payment</li>
                    <li>All payments are non-refundable unless specified</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Cancellation and Rescheduling</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Cancellation Policy</h3>
                  <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
                    <li>Cancellations made 30+ days before event: 80% refund of advance</li>
                    <li>Cancellations made 15-29 days before event: 50% refund of advance</li>
                    <li>Cancellations made less than 15 days before event: No refund</li>
                    <li>No-show on scheduled date: Full payment charged</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Rescheduling</h3>
                  <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
                    <li>Rescheduling requests subject to availability</li>
                    <li>Rescheduling more than 15 days before: No additional charge</li>
                    <li>Rescheduling 7-14 days before: 25% of advance as rescheduling fee</li>
                    <li>Rescheduling less than 7 days before: 50% of advance as rescheduling fee</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Client Responsibilities</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-4">
                As a client, you agree to:
              </p>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Provide accurate information for booking</li>
                <li>Be ready at the scheduled time</li>
                <li>Ensure proper lighting and ventilation at the venue</li>
                <li>Inform us of any skin allergies or sensitivities</li>
                <li>Provide access to venue for home services</li>
                <li>Respect the artist&apos;s professional boundaries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Service Quality and Limitations</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed mb-4">
                While we strive for excellence, please note:
              </p>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Makeup longevity depends on skin type, weather, and activities</li>
                <li>We cannot guarantee exact color matches due to lighting variations</li>
                <li>Results may vary based on individual skin conditions</li>
                <li>We are not responsible for pre-existing skin conditions</li>
                <li>Touch-up kits and aftercare instructions will be provided</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Travel and Venue Requirements</h2>
              <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-2">
                <li>Travel charges apply for home services beyond specified radius</li>
                <li>Client must ensure safe parking and venue access</li>
                <li>Adequate lighting and mirror space must be available</li>
                <li>We reserve the right to refuse service in unsafe conditions</li>
                <li>Additional charges may apply for stairs, lifts, or difficult access</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Intellectual Property</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                All content on our website, including images, text, and designs, is our property or licensed to us. You may not use, reproduce, or distribute our content without permission. Portfolio images may be used for promotional purposes with client consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                Glow with Rubi shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our services. Our total liability is limited to the amount paid for the specific service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Governing Law</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                These terms shall be governed by the laws of India. Any disputes shall be resolved through arbitration in [Your City], India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="p-4 bg-[var(--color-muted)]/30 rounded-lg">
                <p className="font-medium">Glow with Rubi</p>
                <p className="text-[var(--color-muted-foreground)]">Email: legal@glowwithrubi.com</p>
                <p className="text-[var(--color-muted-foreground)]">Phone: +91 XXXXX XXXXX</p>
                <p className="text-[var(--color-muted-foreground)]">Address: [Your Business Address]</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}