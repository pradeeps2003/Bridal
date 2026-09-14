import { describe, expect, it } from "vitest";

import { createBookingSchema } from "@/lib/booking/validation";

const valid = {
  package_id: "00000000-0000-0000-0000-000000000010",
  addon_ids: [],
  event_date: "2026-12-12",
  start_time: "10:00",
  location_type: "studio" as const,
  customer: {
    full_name: "Ananya Sharma",
    phone: "9876543210",
    email: "ananya@example.com",
  },
};

describe("createBookingSchema", () => {
  it("accepts a studio booking", () => {
    expect(createBookingSchema.parse(valid).location_type).toBe("studio");
  });

  it("requires address and pincode for home service", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      location_type: "home",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid Indian phone number", () => {
    const result = createBookingSchema.safeParse({
      ...valid,
      customer: { ...valid.customer, phone: "12345" },
    });
    expect(result.success).toBe(false);
  });
});
