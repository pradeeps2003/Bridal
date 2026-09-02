import { Suspense } from "react";

import { BookingWizard } from "@/components/booking/booking-wizard";
import { PageHero, PageShell } from "@/components/layout/page-shell";
import { getActiveAddons } from "@/lib/data/addons";
import { getActivePackages } from "@/lib/data/packages";
import {
  getBookingSettings,
  getPaymentSettings,
  getServiceSettings,
} from "@/lib/data/settings";
import { getActiveServices } from "@/lib/data/services";

export default async function BookPage() {
  const [services, packages, addons, bookingSettings, paymentSettings, serviceSettings, businessSettings] =
    await Promise.all([
      getActiveServices(),
      getActivePackages(),
      getActiveAddons(),
      getBookingSettings(),
      getPaymentSettings(),
      getServiceSettings(),
      import("@/lib/data/settings").then(m => m.getSiteSettings()),
    ]);

  return (
    <PageShell>
      <div className="container-narrow px-6">
        <PageHero
          badge="3-step booking"
          title="Book Your Date"
          description="Choose your look and schedule, then continue to WhatsApp with a pre-filled request. Tap Send there so Rubi can confirm availability and final pricing."
        />
        <Suspense fallback={<p className="text-center text-sm text-[var(--color-muted-foreground)]">Loading…</p>}>
          <BookingWizard
            services={services}
            packages={packages}
            addons={addons}
            bookingSettings={bookingSettings}
            paymentSettings={paymentSettings}
            serviceSettings={serviceSettings}
            businessSettings={businessSettings}
          />
        </Suspense>
      </div>
    </PageShell>
  );
}
