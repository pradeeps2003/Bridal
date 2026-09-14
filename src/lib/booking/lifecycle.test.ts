import { describe, expect, it } from "vitest";

import {
  adminRefundNote,
  customerRefundMessage,
  isWithinNoRefundWindow,
} from "@/lib/booking/cancellation";
import { assertTransition, canTransition } from "@/lib/booking/state-machine";
import { createBookingSchema } from "@/lib/booking/validation";
import { remainingBalance } from "@/lib/payments/confirm";
import { addHoursToTime, calculateBookingPrice } from "@/lib/pricing/calculate";
import type { Package, PaymentSettings, ServiceSettings } from "@/types";

const pkg: Package = {
  id: "00000000-0000-0000-0000-000000000010",
  service_id: "00000000-0000-0000-0000-000000000001",
  name: "Signature bridal",
  slug: "signature-bridal",
  description: "HD bridal look",
  price: 20000,
  pricing_type: "FIXED",
  duration_hours: 3,
  is_active: true,
  display_order: 1,
};

const paymentSettings: PaymentSettings = {
  mode: "ADVANCE_PERCENTAGE",
  advance_percentage: 30,
  fixed_advance: 2000,
};

const serviceSettings: ServiceSettings = {
  home_service_enabled: true,
  travel_charge_base: 0,
  travel_charge_per_km: 0,
  travel_radius_km: 50,
  long_distance_fixed_fee: 1000,
};

describe("one booking: payment page, cancel, refund", () => {
  it("walks a studio booking from request through advance payment and cancel/refund rules", () => {
    const payload = createBookingSchema.parse({
      package_id: pkg.id,
      addon_ids: [],
      event_date: "2026-12-20",
      start_time: "09:00",
      location_type: "studio",
      customer: {
        full_name: "Meera Krishnan",
        phone: "9876543210",
        email: "meera@example.com",
      },
    });

    const pricing = calculateBookingPrice({
      pkg,
      addons: [],
      locationType: payload.location_type,
      serviceSettings,
      paymentSettings,
    });

    expect(pricing.is_custom_quote).toBe(false);
    expect(pricing.subtotal).toBe(20000);
    expect(pricing.travel_fee).toBe(0);
    expect(pricing.total).toBe(20000);
    expect(pricing.advance).toBe(6000);
    expect(pricing.balance).toBe(14000);
    expect(addHoursToTime(payload.start_time, pkg.duration_hours)).toBe("12:00:00");

    const paymentPage = {
      status: "PAYMENT_PENDING" as const,
      amountDueNow: pricing.advance,
      remainingOnEventDay: pricing.balance,
    };
    expect(paymentPage.amountDueNow).toBe(6000);
    expect(paymentPage.remainingOnEventDay).toBe(14000);

    const path = [
      ["HELD", "ADMIN_APPROVED"],
      ["ADMIN_APPROVED", "PAYMENT_PENDING"],
      ["PAYMENT_PENDING", "CONFIRMED"],
      ["CONFIRMED", "CANCELLED"],
    ] as const;
    for (const [from, to] of path) {
      expect(canTransition(from, to)).toBe(true);
      expect(() => assertTransition(from, to)).not.toThrow();
    }
    expect(() => assertTransition("CANCELLED", "CONFIRMED")).toThrow(/Invalid booking transition/);

    const capturedAdvance = [{ amount: pricing.advance, status: "CAPTURED" }];
    expect(remainingBalance(pricing.total, capturedAdvance)).toBe(14000);

    const farEvent = payload.event_date;
    expect(isWithinNoRefundWindow(farEvent, new Date("2026-09-13"))).toBe(false);
    expect(customerRefundMessage(farEvent, true)).toMatch(/decided by the studio/i);
    expect(adminRefundNote(farEvent, true, "customer")).toMatch(/Please decide whether to send the advance back via UPI/);

    const soonEvent = "2026-09-16";
    expect(isWithinNoRefundWindow(soonEvent, new Date("2026-09-13"))).toBe(true);
    expect(customerRefundMessage(soonEvent, true)).toMatch(/less than 7 days/);
    expect(adminRefundNote(soonEvent, true, "admin")).toMatch(/policy is no advance return/);

    expect(customerRefundMessage(farEvent, false)).toMatch(/nothing needs to be refunded/);
    expect(adminRefundNote(farEvent, false, "customer")).toMatch(/No captured advance/);
  });

  it("charges long-distance home travel on the payment breakdown", () => {
    const pricing = calculateBookingPrice({
      pkg,
      addons: [{ id: "addon-1", price: 0, slug: "hair-extension", pricing_type: "CUSTOM_QUOTE" }],
      locationType: "home",
      serviceSettings,
      paymentSettings,
      distanceKm: 80,
    });

    expect(pricing.travel_fee).toBe(1000);
    expect(pricing.has_negotiable_addons).toBe(true);
    expect(pricing.addons_total).toBe(0);
    expect(pricing.total).toBe(21000);
    expect(pricing.advance).toBe(6300);
    expect(pricing.balance).toBe(14700);
  });
});
