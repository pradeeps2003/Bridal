import { z } from "zod";

export const createBookingSchema = z
  .object({
    package_id: z.string().uuid("Please select a valid package"),
    addon_ids: z.array(z.string().uuid()).default([]),
    event_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid event date"),
    start_time: z
      .string()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Please select a valid start time"),
    location_type: z.enum(["home", "studio"]),
    address: z.string().trim().max(500, "Address is too long").optional(),
    pincode: z
      .string()
      .regex(/^\d{6}$/, "Pincode must be 6 digits")
      .optional(),
    notes: z.string().trim().max(1000, "Notes are too long").optional(),
    coupon_code: z.string().trim().max(20, "Coupon code is too long").optional(),
    customer: z.object({
      full_name: z.string().trim().min(2, "Please enter your full name").max(120),
      phone: z
        .string()
        .trim()
        .regex(/^(?:\+?91[-\s]?)?[6-9]\d{9}$/, "Please enter a valid Indian phone number"),
      email: z.string().trim().email("Please enter a valid email address").optional().or(z.literal("")),
      whatsapp: z.string().trim().optional(),
    }),
  })
  .superRefine((value, ctx) => {
    if (value.location_type === "home" && !value.address?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["address"], message: "Home service needs an address" });
    }
    if (value.location_type === "home" && !value.pincode) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["pincode"], message: "Home service needs a 6-digit pincode" });
    }
  });

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "REQUESTED",
    "HELD",
    "ADMIN_APPROVED",
    "PAYMENT_PENDING",
    "CONFIRMED",
    "REJECTED",
    "EXPIRED",
    "CANCELLED",
    "COMPLETED",
  ]),
  admin_notes: z.string().max(2000).optional(),
  discount: z.number().min(0).optional(),
});

export const availabilityQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  package_id: z.string().min(1),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
