"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/data/admin";
import { canAdmin } from "@/lib/auth/permissions";
import type { AdminPermission } from "@/lib/notifications/types";
import { logAudit, updateSiteSetting } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { capturePendingPayments } from "@/lib/payments/confirm";
import {
  notifyCustomerPaymentReceived,
  notifyCustomerStatusChange,
  sendCriticalStatusSms,
} from "@/lib/notifications/orchestrator";
import { assertTransition } from "@/lib/booking/state-machine";
import { updateBookingStatusSchema } from "@/lib/booking/validation";
import type { AdminRole, BookingStatus } from "@/types";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireAdmin(permission?: AdminPermission) {
  const session = await getCurrentAdmin();
  if (!session) throw new Error("Unauthorized");
  if (permission && !canAdmin(session.admin.role as AdminRole, permission)) {
    throw new Error("You don’t have permission to perform this action.");
  }
  return session;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// --- Services ---

const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().optional(),
  display_order: z.coerce.number().int().min(0, "Display order must be 0 or greater").default(0),
  is_active: z.coerce.boolean().default(true),
});

export async function createService(formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  
  try {
    const parsed = serviceSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase.from("services").insert({
      ...parsed,
      slug: slugify(parsed.name),
    });

    if (error) throw new Error(error.message);
    await logAudit(admin.id, "create", "services", null, parsed);
    revalidatePath("/admin/services");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function updateService(id: string, formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  
  try {
    const parsed = serviceSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("services")
      .update({ ...parsed, slug: slugify(parsed.name) })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await logAudit(admin.id, "update", "services", id, parsed);
    revalidatePath("/admin/services");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function deleteService(id: string) {
  const { admin } = await requireAdmin("catalogue.manage");
  const supabase = createAdminClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "delete", "services", id);
  revalidatePath("/admin/services");
}

// --- Packages ---

const packageSchema = z.object({
  service_id: z.string().uuid("Please select a valid service"),
  name: z.string().min(2, "Package name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  pricing_type: z.enum(["FIXED", "STARTING_FROM", "CUSTOM_QUOTE"]),
  duration_hours: z.coerce.number().min(0.5, "Duration must be at least 0.5 hours"),
  display_order: z.coerce.number().int().min(0, "Display order must be 0 or greater").default(0),
  is_active: z.coerce.boolean().default(true),
  inclusions: z.string().optional(),
  image_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  sale_type: z.enum(["none", "percent", "amount"]).default("none"),
  sale_value: z.coerce.number().min(0, "Sale value must be 0 or greater").default(0),
  sale_starts_at: z.string().optional(),
  sale_ends_at: z.string().optional(),
});

export async function createPackage(formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  const raw = Object.fromEntries(formData);
  
  try {
    const parsed = packageSchema.parse(raw);
    const supabase = createAdminClient();

    const { data: pkg, error } = await supabase
      .from("packages")
      .insert({
        service_id: parsed.service_id,
        name: parsed.name,
        slug: slugify(parsed.name),
        description: parsed.description ?? null,
        price: parsed.price,
        pricing_type: parsed.pricing_type,
        duration_hours: parsed.duration_hours,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        image_url: parsed.image_url || null,
        sale_type: parsed.sale_type,
        sale_value: parsed.sale_value,
        sale_starts_at: parsed.sale_starts_at ? new Date(parsed.sale_starts_at).toISOString() : null,
        sale_ends_at: parsed.sale_ends_at ? new Date(parsed.sale_ends_at).toISOString() : null,
      })
      .select("id")
      .single();

    if (error || !pkg) throw new Error(error?.message ?? "Failed to create package");

    const inclusions = (parsed.inclusions ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (inclusions.length) {
      await supabase.from("package_items").insert(
        inclusions.map((label, i) => ({
          package_id: pkg.id,
          label,
          display_order: i + 1,
        })),
      );
    }

    await logAudit(admin.id, "create", "packages", pkg.id, parsed);
    revalidatePath("/admin/packages");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function updatePackage(id: string, formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  
  try {
    const parsed = packageSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("packages")
      .update({
        service_id: parsed.service_id,
        name: parsed.name,
        slug: slugify(parsed.name),
        description: parsed.description ?? null,
        price: parsed.price,
        pricing_type: parsed.pricing_type,
        duration_hours: parsed.duration_hours,
        display_order: parsed.display_order,
        is_active: parsed.is_active,
        image_url: parsed.image_url || null,
        sale_type: parsed.sale_type,
        sale_value: parsed.sale_value,
        sale_starts_at: parsed.sale_starts_at ? new Date(parsed.sale_starts_at).toISOString() : null,
        sale_ends_at: parsed.sale_ends_at ? new Date(parsed.sale_ends_at).toISOString() : null,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);

    await supabase.from("package_items").delete().eq("package_id", id);
    const inclusions = (parsed.inclusions ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (inclusions.length) {
      await supabase.from("package_items").insert(
        inclusions.map((label, i) => ({
          package_id: id,
          label,
          display_order: i + 1,
        })),
      );
    }

    await logAudit(admin.id, "update", "packages", id, parsed);
    revalidatePath("/admin/packages");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function deletePackage(id: string) {
  const { admin } = await requireAdmin("catalogue.manage");
  const supabase = createAdminClient();
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "delete", "packages", id);
  revalidatePath("/admin/packages");
}

// --- Add-ons ---

const addonSchema = z.object({
  name: z.string().min(2, "Addon name must be at least 2 characters"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  pricing_type: z.enum(["FIXED", "STARTING_FROM", "CUSTOM_QUOTE"]).default("FIXED"),
  display_order: z.coerce.number().int().min(0, "Display order must be 0 or greater").default(0),
  is_active: z.coerce.boolean().default(true),
});

export async function createAddon(formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  
  try {
    const parsed = addonSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase.from("addons").insert({
      ...parsed,
      slug: slugify(parsed.name),
    });

    if (error) throw new Error(error.message);
    await logAudit(admin.id, "create", "addons", null, parsed);
    revalidatePath("/admin/addons");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function updateAddon(id: string, formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  
  try {
    const parsed = addonSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("addons")
      .update({ ...parsed, slug: slugify(parsed.name) })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await logAudit(admin.id, "update", "addons", id, parsed);
    revalidatePath("/admin/addons");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function deleteAddon(id: string) {
  const { admin } = await requireAdmin("catalogue.manage");
  const supabase = createAdminClient();
  const { error } = await supabase.from("addons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "delete", "addons", id);
  revalidatePath("/admin/addons");
}

// --- Portfolio ---

const portfolioSchema = z.object({
  title: z.string().optional(),
  category: z.enum(["Bridal", "Reception", "Engagement", "Party", "Maternity", "Hair"]),
  image_url: z.string().url().optional().or(z.literal("")),
  video_url: z.string().url().optional().or(z.literal("")),
  is_published: z.coerce.boolean().default(false),
  display_order: z.coerce.number().int().min(0).default(0),
});

export async function createPortfolioItem(formData: FormData) {
  const { admin } = await requireAdmin("content.manage");
  const parsed = portfolioSchema.parse(Object.fromEntries(formData));
  const supabase = createAdminClient();

  const { error } = await supabase.from("portfolio_items").insert({
    ...parsed,
    image_url: parsed.image_url || null,
    video_url: parsed.video_url || null,
  });

  if (error) throw new Error(error.message);
  await logAudit(admin.id, "create", "portfolio_items", null, parsed);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function updatePortfolioItem(id: string, formData: FormData) {
  const { admin } = await requireAdmin("content.manage");
  const parsed = portfolioSchema.parse(Object.fromEntries(formData));
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("portfolio_items")
    .update({
      ...parsed,
      image_url: parsed.image_url || null,
      video_url: parsed.video_url || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  await logAudit(admin.id, "update", "portfolio_items", id, parsed);
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
}

export async function deletePortfolioItem(id: string) {
  const { admin } = await requireAdmin("content.manage");
  const supabase = createAdminClient();
  const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "delete", "portfolio_items", id);
  revalidatePath("/admin/portfolio");
}

// --- Settings ---

export async function updateBusinessSettings(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  await updateSiteSetting(
    "business",
    {
      name: formData.get("business_name"),
      phone: formData.get("phone"),
      whatsapp: formData.get("whatsapp"),
      instagram: formData.get("instagram"),
      email: formData.get("email"),
      address: formData.get("address"),
      google_review_url: formData.get("google_review_url"),
    },
    admin.id,
  );
  revalidatePath("/admin/settings");
}

export async function updateBookingSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  await updateSiteSetting(
    "booking",
    {
      min_advance_hours: Number(formData.get("min_advance_hours")),
      hold_duration_hours: Number(formData.get("hold_duration_hours")),
      buffer_hours: Number(formData.get("buffer_hours")),
      cancellation_policy: formData.get("cancellation_policy"),
    },
    admin.id,
  );
  revalidatePath("/admin/settings");
}

export async function updatePaymentSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  await updateSiteSetting(
    "payment",
    {
      upi_id: formData.get("upi_id") ?? "",
      mode: formData.get("mode"),
      advance_percentage: Number(formData.get("advance_percentage")),
      fixed_advance: Number(formData.get("fixed_advance")),
    },
    admin.id,
  );
  revalidatePath("/admin/settings");
}

export async function updateServiceSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  await updateSiteSetting(
    "service",
    {
      home_service_enabled: formData.get("home_service_enabled") === "true",
      travel_charge_base: Number(formData.get("travel_charge_base")),
      travel_charge_per_km: Number(formData.get("travel_charge_per_km")),
      travel_radius_km: Number(formData.get("travel_radius_km")),
    },
    admin.id,
  );
  revalidatePath("/admin/settings");
}

export async function updateAllSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  
  // Update all settings in parallel
  await Promise.all([
    updateSiteSetting(
      "business",
      {
        name: formData.get("business_name"),
        phone: formData.get("phone"),
        whatsapp: formData.get("whatsapp"),
        instagram: formData.get("instagram"),
        email: formData.get("email"),
        address: formData.get("address"),
        google_review_url: formData.get("google_review_url"),
      },
      admin.id,
    ),
    updateSiteSetting(
      "booking",
      {
        min_advance_hours: Number(formData.get("min_advance_hours")),
        hold_duration_hours: Number(formData.get("hold_duration_hours")),
        buffer_hours: Number(formData.get("buffer_hours")),
        cancellation_policy: formData.get("cancellation_policy"),
      },
      admin.id,
    ),
    updateSiteSetting(
      "payment",
      {
        upi_id: formData.get("upi_id") ?? "",
        mode: formData.get("mode"),
        advance_percentage: Number(formData.get("advance_percentage")),
        fixed_advance: Number(formData.get("fixed_advance")),
      },
      admin.id,
    ),
    updateSiteSetting(
      "service",
      {
        home_service_enabled: formData.get("home_service_enabled") === "true",
        travel_charge_base: Number(formData.get("travel_charge_base")),
        travel_charge_per_km: Number(formData.get("travel_charge_per_km")),
        travel_radius_km: Number(formData.get("travel_radius_km")),
      },
      admin.id,
    ),
  ]);
  
  revalidatePath("/admin/settings");
}

const adminRoleSchema = z.object({
  admin_id: z.string().uuid("Admin id is invalid"),
  role: z.enum(["owner", "staff"]),
});

export async function updateAdminRoleAction(formData: FormData) {
  const { admin } = await requireAdmin("team.manage");
  const parsed = adminRoleSchema.safeParse({
    admin_id: formData.get("admin_id"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid team update");
  }

  const supabase = createAdminClient();
  const { data: target, error: targetError } = await supabase
    .from("admins")
    .select("id, role, is_active")
    .eq("id", parsed.data.admin_id)
    .single();
  if (targetError || !target || !target.is_active) {
    throw new Error("Active team member not found.");
  }

  if (target.role === "owner" && parsed.data.role === "staff") {
    const { count } = await supabase
      .from("admins")
      .select("id", { count: "exact", head: true })
      .eq("role", "owner")
      .eq("is_active", true);
    if ((count ?? 0) <= 1) {
      throw new Error("Assign another owner before changing this role.");
    }
  }

  const { error } = await supabase
    .from("admins")
    .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.admin_id)
    .eq("is_active", true);
  if (error) throw new Error(error.message);

  await logAudit(admin.id, "update_role", "admins", parsed.data.admin_id, {
    from: target.role,
    to: parsed.data.role,
  });
  revalidatePath("/admin/settings/team");
  revalidatePath("/admin");
}


// --- Testimonials ---

const testimonialSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  quote: z.string().min(5, "Quote must be at least 5 characters"),
  event_type: z.string().optional(),
  is_published: z.coerce.boolean().default(false),
});

export async function createTestimonial(formData: FormData) {
  const { admin } = await requireAdmin("content.manage");
  
  try {
    const parsed = testimonialSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase.from("testimonials").insert({
      full_name: parsed.full_name,
      quote: parsed.quote,
      event_type: parsed.event_type || null,
      is_published: parsed.is_published,
      booking_id: null,
    });

    if (error) throw new Error(error.message);
    await logAudit(admin.id, "create", "testimonials", null, parsed);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function updateTestimonial(id: string, formData: FormData) {
  const { admin } = await requireAdmin("content.manage");
  
  try {
    const parsed = testimonialSchema.parse(Object.fromEntries(formData));
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("testimonials")
      .update({
        full_name: parsed.full_name,
        quote: parsed.quote,
        event_type: parsed.event_type || null,
        is_published: parsed.is_published,
      })
      .eq("id", id);

    if (error) throw new Error(error.message);
    await logAudit(admin.id, "update", "testimonials", id, parsed);
    revalidatePath("/admin/testimonials");
    revalidatePath("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues.map(issue => issue.message).join(", "));
    }
    throw error;
  }
}

export async function deleteTestimonialAction(id: string) {
  const { admin } = await requireAdmin("content.manage");
  const supabase = createAdminClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "delete", "testimonials", id);
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

export async function toggleTestimonialPublishAction(id: string, isPublished: boolean) {
  const { admin } = await requireAdmin("content.manage");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("testimonials")
    .update({ is_published: isPublished })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logAudit(admin.id, "toggle_publish", "testimonials", id, { is_published: isPublished });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}

// --- Availability ---

export async function blockDate(formData: FormData) {
  const { admin } = await requireAdmin("calendar.manage");
  const date = String(formData.get("blocked_date"));
  const reason = String(formData.get("reason") ?? "");
  const supabase = createAdminClient();

  const { error } = await supabase.from("blocked_dates").upsert({
    blocked_date: date,
    reason: reason || null,
  });

  if (error) throw new Error(error.message);
  await logAudit(admin.id, "block_date", "blocked_dates", null, { date, reason });
  revalidatePath("/admin/calendar");
}

export async function unblockDate(date: string) {
  const { admin } = await requireAdmin("calendar.manage");
  const supabase = createAdminClient();
  await supabase.from("blocked_dates").delete().eq("blocked_date", date);
  await logAudit(admin.id, "unblock_date", "blocked_dates", null, { date });
  revalidatePath("/admin/calendar");
}

export async function updateBookingStatusFormAction(formData: FormData) {
  const bookingId = String(formData.get("booking_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const parsed = z.object({
    booking_id: z.string().uuid("Booking id is invalid"),
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
  }).safeParse({ booking_id: bookingId, status });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid booking update");
  await updateBookingStatusAction(parsed.data.booking_id, parsed.data.status);
}

export async function updateBookingStatusAction(bookingId: string, status: string, adminNotes?: string) {
  const { admin } = await requireAdmin("bookings.manage");
  const parsedStatus = updateBookingStatusSchema.safeParse({ status, admin_notes: adminNotes });
  if (!parsedStatus.success) {
    throw new Error(parsedStatus.error.issues[0]?.message ?? "Invalid booking status");
  }
  const supabase = createAdminClient();

  // Fetch booking details before update for notifications
  const { data: booking } = await supabase
    .from("bookings")
    .select(`
      *,
      customers (full_name, phone, whatsapp, email),
      packages (name)
    `)
    .eq("id", bookingId)
    .single();

  if (!booking) throw new Error("Booking not found");
  assertTransition(booking.status as BookingStatus, parsedStatus.data.status as BookingStatus);

  const { error } = await supabase
    .from("bookings")
    .update({
      status: parsedStatus.data.status,
      admin_notes: parsedStatus.data.admin_notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) throw new Error(error.message);
  await logAudit(admin.id, "update_status", "bookings", bookingId, { status: parsedStatus.data.status });
  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);

  if (booking && booking.customers) {
    const customer = booking.customers as {
      full_name: string;
      phone: string;
      whatsapp?: string;
      email?: string | null;
    };
    const notificationContext = {
      bookingId,
      customerName: customer.full_name,
      customerPhone: customer.whatsapp || customer.phone,
      customerEmail: customer.email,
      packageName: booking.packages?.name || "your booking",
      date: booking.event_date,
      time: booking.start_time.slice(0, 5),
      total: String(booking.total),
      advance: String(booking.advance),
    };

    await Promise.allSettled([
      notifyCustomerStatusChange(notificationContext, parsedStatus.data.status as BookingStatus),
      sendCriticalStatusSms(notificationContext, parsedStatus.data.status as BookingStatus),
      parsedStatus.data.status === "CONFIRMED"
        ? capturePendingPayments(bookingId).then((captured) =>
            captured.length ? notifyCustomerPaymentReceived(notificationContext) : null,
          )
        : Promise.resolve(),
    ]);
  }

  if (parsedStatus.data.status === "COMPLETED") {
    try {
      const { sendReviewRequest } = await import("@/lib/notifications/reviews");
      await sendReviewRequest(bookingId);
    } catch (err) {
      console.error("Failed to send review request:", err);
    }
  }
}

// --- Enquiries ---

export async function markEnquiryAsReadAction(enquiryId: string) {
  const { admin } = await requireAdmin("enquiries.manage");
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("enquiries")
    .update({ is_read: true })
    .eq("id", enquiryId);

  if (error) throw new Error(error.message);
  await logAudit(admin.id, "mark_read", "enquiries", enquiryId);
  revalidatePath("/admin/enquiries");
}
