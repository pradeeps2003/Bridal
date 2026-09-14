"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getCurrentAdmin } from "@/lib/data/admin";
import { canAdmin } from "@/lib/auth/permissions";
import type { AdminPermission } from "@/lib/notifications/types";
import { getAboutSettings, getAllSettings, getSiteSettings, logAudit, updateSiteSetting } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isUploadFile, uploadAdminImage } from "@/lib/media/storage";
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

async function resolveSettingsImage(
  formData: FormData,
  fieldName: string,
  existingUrl: string | null | undefined,
  clearFieldName?: string,
) {
  if (clearFieldName && formData.get(clearFieldName) === "true") {
    return null;
  }
  const file = formData.get(fieldName);
  return isUploadFile(file)
    ? (await uploadAdminImage(file, "branding")).publicUrl
    : (existingUrl ?? null);
}

async function resolveSettingsImageList(
  formData: FormData,
  filePrefix: string,
  currentPrefix: string,
  slots: number,
) {
  const uploads = await Promise.all(
    Array.from({ length: slots }, (_, index) =>
      resolveSettingsImage(
        formData,
        `${filePrefix}${index}`,
        String(formData.get(`${currentPrefix}${index}`) ?? "").trim() || null,
      ),
    ),
  );
  return uploads.filter((url): url is string => typeof url === "string" && url.trim().length > 0);
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
    revalidatePath("/services");
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
    revalidatePath("/services");
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
  revalidatePath("/services");
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
  package_type: z.enum(["standard", "popular", "most_ordered", "premium", "new_arrival", "limited"]).default("standard"),
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
    const imageFile = formData.get("image_file");
    const uploadedImage = isUploadFile(imageFile)
      ? await uploadAdminImage(imageFile, "packages")
      : null;
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
        image_url: uploadedImage?.publicUrl ?? (parsed.image_url || null),
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
    revalidatePath("/packages");
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
    const imageFile = formData.get("image_file");
    let imageUrl = parsed.image_url || null;

    if (!isUploadFile(imageFile)) {
      const { data: existingPackage, error: existingError } = await supabase
        .from("packages")
        .select("image_url")
        .eq("id", id)
        .single();
      if (existingError) throw new Error(existingError.message);
      imageUrl = existingPackage?.image_url ?? null;
    } else {
      imageUrl = (await uploadAdminImage(imageFile, "packages")).publicUrl;
    }

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
        image_url: imageUrl,
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
    revalidatePath("/packages");
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
  revalidatePath("/packages");
}

// --- Add-ons ---

const addonSchema = z.object({
  name: z.string().trim().min(2, "Addon name must be at least 2 characters"),
  description: z.string().trim().optional(),
  price: z.preprocess((value) => value === "" || value == null ? 0 : value, z.coerce.number().min(0, "Price must be 0 or greater")),
  pricing_type: z.enum(["FIXED", "STARTING_FROM", "CUSTOM_QUOTE"]).default("CUSTOM_QUOTE"),
  display_order: z.preprocess((value) => value === "" || value == null ? 0 : value, z.coerce.number().int().min(0, "Display order must be 0 or greater")),
  is_active: z.boolean(),
});

function isMissingDbColumn(error: { code?: string; message?: string } | null, column: string) {
  if (!error) return false;
  const message = error.message ?? "";
  return error.code === "PGRST204" || message.includes(`'${column}' column`) || message.includes("schema cache");
}

async function saveAddonRow(
  supabase: ReturnType<typeof createAdminClient>,
  parsed: z.infer<typeof addonSchema>,
  slug: string,
  id?: string,
) {
  const row = { ...parsed, slug, description: parsed.description ?? null };
  const query = id
    ? supabase.from("addons").update(row).eq("id", id)
    : supabase.from("addons").insert(row);
  let { error } = await query;

  if (isMissingDbColumn(error, "pricing_type")) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pricing_type: _pricingType, ...withoutPricing } = row;
    const fallback = id
      ? supabase.from("addons").update(withoutPricing).eq("id", id)
      : supabase.from("addons").insert(withoutPricing);
    ({ error } = await fallback);
  }

  if (error?.code === "23505") throw new Error("An add-on with this name already exists.");
  if (error) throw new Error(`Could not save add-on: ${error.message}`);
}

function parseAddonFormData(formData: FormData) {
  return addonSchema.parse({
    name: formData.get("name"),
    description: String(formData.get("description") ?? "").trim() || undefined,
    price: formData.get("price"),
    pricing_type: formData.get("pricing_type") ?? "CUSTOM_QUOTE",
    display_order: formData.get("display_order"),
    is_active: formData.get("is_active") === "true" || formData.get("is_active") === "on",
  });
}

export async function createAddon(formData: FormData) {
  const { admin } = await requireAdmin("catalogue.manage");
  
  try {
    const parsed = parseAddonFormData(formData);
    const supabase = createAdminClient();
    const slug = slugify(parsed.name);
    if (!slug) throw new Error("Addon name must contain at least one letter or number.");

    await saveAddonRow(supabase, parsed, slug);
    await logAudit(admin.id, "create", "addons", null, parsed);
    revalidatePath("/admin/addons");
    revalidatePath("/");
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
    const parsed = parseAddonFormData(formData);
    const supabase = createAdminClient();
    const slug = slugify(parsed.name);
    if (!slug) throw new Error("Addon name must contain at least one letter or number.");

    await saveAddonRow(supabase, parsed, slug, id);
    await logAudit(admin.id, "update", "addons", id, parsed);
    revalidatePath("/admin/addons");
    revalidatePath("/");
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
  revalidatePath("/");
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
  const imageFile = formData.get("image_file");
  if (!isUploadFile(imageFile)) throw new Error("Please choose a portfolio image.");
  const imageUrl = (await uploadAdminImage(imageFile, "portfolio")).publicUrl;
  const supabase = createAdminClient();

  const { error } = await supabase.from("portfolio_items").insert({
    ...parsed,
    image_url: imageUrl,
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
  const { data: existingItem, error: existingError } = await supabase
    .from("portfolio_items")
    .select("image_url, video_url")
    .eq("id", id)
    .single();
  if (existingError || !existingItem) throw new Error(existingError?.message ?? "Portfolio item not found");

  const imageFile = formData.get("image_file");
  const imageUrl = isUploadFile(imageFile)
    ? (await uploadAdminImage(imageFile, "portfolio")).publicUrl
    : existingItem.image_url;

  const { error } = await supabase
    .from("portfolio_items")
    .update({
      ...parsed,
      image_url: imageUrl,
      video_url: parsed.video_url || existingItem.video_url || null,
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

export async function getAdminSettingsAction() {
  await requireAdmin("settings.manage");
  return getAllSettings();
}

export async function updateBusinessSettings(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  const existing = await getSiteSettings();
  const showcaseSlots = Number(formData.get("hero_image_slots") || 0);
  const showcaseImageUrls = await resolveSettingsImageList(
    formData,
    "hero_image_file_",
    "hero_image_current_",
    showcaseSlots,
  );

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
      admin_login_image_url: await resolveSettingsImage(
        formData,
        "admin_login_image_file",
        existing.admin_login_image_url,
        "admin_login_image_clear",
      ),
      hero_image_urls: showcaseImageUrls,
      footer_image_urls: showcaseImageUrls,
    },
    admin.id,
  );
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function updateBookingSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  await updateSiteSetting(
    "booking",
    {
      min_advance_hours: Number(formData.get("min_advance_hours")),
      hold_duration_hours: Number(formData.get("hold_duration_hours")),
      buffer_hours: Number(formData.get("buffer_hours")),
      travel_buffer_hours: Number(formData.get("travel_buffer_hours") || 0),
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
      long_distance_fixed_fee: Number(formData.get("long_distance_fixed_fee") || 1000),
    },
    admin.id,
  );
  revalidatePath("/admin/settings");
}

export async function updateAllSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  const existing = await getSiteSettings();
  const couponsEnabled = formData.get("coupons_enabled") === "true";
  const showcaseSlots = Number(formData.get("hero_image_slots") || 0);
  const adminLoginImageUrl = await resolveSettingsImage(
    formData,
    "admin_login_image_file",
    existing.admin_login_image_url,
    "admin_login_image_clear",
  );
  const showcaseImageUrls = await resolveSettingsImageList(
    formData,
    "hero_image_file_",
    "hero_image_current_",
    showcaseSlots,
  );

  // Parse featured package IDs from form data
  const featuredPackageIds: string[] = [];
  let pkgIndex = 1;
  while (formData.has(`featured_package_${pkgIndex}`)) {
    const id = formData.get(`featured_package_${pkgIndex}`) as string;
    if (id && id.trim()) {
      featuredPackageIds.push(id.trim());
    }
    pkgIndex++;
  }

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
        admin_login_image_url: adminLoginImageUrl,
        hero_image_urls: showcaseImageUrls,
        footer_image_urls: showcaseImageUrls,
        featured_package_ids: featuredPackageIds,
      },
      admin.id,
    ),
    updateSiteSetting(
      "booking",
      {
        min_advance_hours: Number(formData.get("min_advance_hours")),
        hold_duration_hours: Number(formData.get("hold_duration_hours")),
        buffer_hours: Number(formData.get("buffer_hours")),
        travel_buffer_hours: Number(formData.get("travel_buffer_hours") || 0),
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
        long_distance_fixed_fee: Number(formData.get("long_distance_fixed_fee") || 1000),
      },
      admin.id,
    ),
    updateSiteSetting("checkout", { coupons_enabled: couponsEnabled }, admin.id),
  ]);
  
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/admin/login");
  revalidatePath("/login");
  revalidatePath("/signup");
  revalidatePath("/forgot-password");
  revalidatePath("/reset-password");
}

export async function updateBrandImagesSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("settings.manage");
  const existing = await getSiteSettings();
  const showcaseSlots = Number(formData.get("hero_image_slots") || 0);
  const showcaseImageUrls = await resolveSettingsImageList(
    formData,
    "hero_image_file_",
    "hero_image_current_",
    showcaseSlots,
  );

  await updateSiteSetting(
    "business",
    {
      name: existing.business_name,
      phone: existing.phone,
      whatsapp: existing.whatsapp,
      instagram: existing.instagram,
      email: existing.email,
      address: existing.address,
      google_review_url: existing.google_review_url,
      admin_login_image_url: await resolveSettingsImage(
        formData,
        "admin_login_image_file",
        existing.admin_login_image_url,
      ),
      hero_image_urls: showcaseImageUrls,
      footer_image_urls: showcaseImageUrls,
    },
    admin.id,
  );

  revalidatePath("/admin/images");
  revalidatePath("/", "layout");
  revalidatePath("/admin/login");
  revalidatePath("/login");
  revalidatePath("/signup");
  revalidatePath("/forgot-password");
  revalidatePath("/reset-password");
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
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
}


// --- About page ---

const aboutSchema = z.object({
  badge: z.string().trim().min(2).max(80),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(500),
  artist_label: z.string().trim().min(2).max(80),
  artist_name: z.string().trim().min(2).max(120),
  artist_statement: z.string().trim().min(2).max(500),
  body: z.string().trim().min(2).max(2000),
  pillar_0_title: z.string().trim().min(2).max(120),
  pillar_0_copy: z.string().trim().min(2).max(500),
  pillar_1_title: z.string().trim().min(2).max(120),
  pillar_1_copy: z.string().trim().min(2).max(500),
  pillar_2_title: z.string().trim().min(2).max(120),
  pillar_2_copy: z.string().trim().min(2).max(500),
});

export async function updateAboutSettingsAction(formData: FormData) {
  const { admin } = await requireAdmin("content.manage");
  const parsed = aboutSchema.parse({
    badge: formData.get("badge"),
    title: formData.get("title"),
    description: formData.get("description"),
    artist_label: formData.get("artist_label"),
    artist_name: formData.get("artist_name"),
    artist_statement: formData.get("artist_statement"),
    body: formData.get("body"),
    pillar_0_title: formData.get("pillar_0_title"),
    pillar_0_copy: formData.get("pillar_0_copy"),
    pillar_1_title: formData.get("pillar_1_title"),
    pillar_1_copy: formData.get("pillar_1_copy"),
    pillar_2_title: formData.get("pillar_2_title"),
    pillar_2_copy: formData.get("pillar_2_copy"),
  });

  const existing = await getAboutSettings();
  const imageFile = formData.get("image_file");
  const artistImageUrl = isUploadFile(imageFile)
    ? (await uploadAdminImage(imageFile, "about")).publicUrl
    : existing.artist_image_url ?? null;

  await updateSiteSetting("about", {
    badge: parsed.badge,
    title: parsed.title,
    description: parsed.description,
    artist_label: parsed.artist_label,
    artist_name: parsed.artist_name,
    artist_statement: parsed.artist_statement,
    body: parsed.body,
    artist_image_url: artistImageUrl,
    pillars: [
      { title: parsed.pillar_0_title, copy: parsed.pillar_0_copy },
      { title: parsed.pillar_1_title, copy: parsed.pillar_1_copy },
      { title: parsed.pillar_2_title, copy: parsed.pillar_2_copy },
    ],
  }, admin.id);

  revalidatePath("/admin/about");
  revalidatePath("/about");
}

// --- Testimonials ---

const testimonialSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  quote: z.string().min(5, "Quote must be at least 5 characters"),
  event_type: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5, "Rating must be between 1 and 5"),
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
      rating: parsed.rating,
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
        rating: parsed.rating,
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
