import { Suspense } from "react";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageHero, PageShell } from "@/components/layout/page-shell";
import { ScrollAnimate } from "@/components/ui/scroll-animate";
import { getActiveAddons } from "@/lib/data/addons";
import { getActivePackages } from "@/lib/data/packages";
import {
  getBookingSettings,
  getCheckoutSettings,
  getPaymentSettings,
  getServiceSettings,
} from "@/lib/data/settings";
import { getActiveServices } from "@/lib/data/services";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Book bridal makeup",
  description:
    "Book HD bridal, reception, or party makeup in Pollachi, Coimbatore, Udumalpet, Tiruppur, or anywhere in Tamil Nadu. Home and venue dates online.",
  keywords: ["book bridal makeup Pollachi", "wedding makeup booking Coimbatore", "home service makeup Tamil Nadu"],
};

export default async function BookPage() {
  const [services, packages, addons, bookingSettings, paymentSettings, serviceSettings, checkoutSettings, businessSettings] =
    await Promise.all([
      getActiveServices(),
      getActivePackages(),
      getActiveAddons(),
      getBookingSettings(),
      getPaymentSettings(),
      getServiceSettings(),
      getCheckoutSettings(),
      import("@/lib/data/settings").then(m => m.getSiteSettings()),
    ]);

  return (
    <PageShell>
      <div className="container-narrow px-6">
        <PageHero
          badge="4-step booking"
          title="Book Your Date"
          description="Choose your look and date. Home and venue service from Pollachi across Coimbatore and Tamil Nadu."
        />
        <ScrollAnimate animation="fade-up" delay={0.2}>
          <Suspense fallback={<p className="text-center text-sm text-[var(--color-muted-foreground)]">Loading…</p>}>
            <BookingWizard
              services={services}
              packages={packages}
              addons={addons}
              bookingSettings={bookingSettings}
              paymentSettings={paymentSettings}
              serviceSettings={serviceSettings}
              couponsEnabled={checkoutSettings.coupons_enabled}
              businessSettings={businessSettings}
            />
          </Suspense>
        </ScrollAnimate>
      </div>
    </PageShell>
  );
}
