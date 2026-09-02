import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  BookingSettings,
  PaymentSettings,
  ServiceSettings,
  SiteSettings,
} from "@/types";

const DEFAULT_BUSINESS: SiteSettings = {
  business_name: "Glow with Rubi",
  phone: "918526475322",
  whatsapp: "918526475322",
  instagram: "glow_with_rubi",
  email: "",
  address: "",
  google_review_url: "",
};


const DEFAULT_BOOKING: BookingSettings = {
  min_advance_hours: 48,
  hold_duration_hours: 0.25,
  buffer_hours: 0.5,
  cancellation_policy:
    "Cancellation must be made at least 48 hours before the event for a full refund of advance.",
};

const DEFAULT_PAYMENT: PaymentSettings = {
  mode: "ADVANCE_PERCENTAGE",
  advance_percentage: 30,
  fixed_advance: 2000,
};

const DEFAULT_SERVICE: ServiceSettings = {
  home_service_enabled: true,
  travel_charge_base: 500,
  travel_charge_per_km: 15,
  travel_radius_km: 40,
};

async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", key)
      .single();

    if (error || !data?.value) return fallback;
    return { ...fallback, ...(data.value as object) } as T;
  } catch {
    return fallback;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const business = await fetchSetting("business", {
    name: DEFAULT_BUSINESS.business_name,
    phone: DEFAULT_BUSINESS.phone,
    whatsapp: DEFAULT_BUSINESS.whatsapp,
    instagram: DEFAULT_BUSINESS.instagram,
    email: "",
    address: "",
    google_review_url: "",
  });

  return {
    business_name: (business as { name?: string }).name ?? DEFAULT_BUSINESS.business_name,
    phone: (business as { phone?: string }).phone || DEFAULT_BUSINESS.phone,
    whatsapp: (business as { whatsapp?: string }).whatsapp || DEFAULT_BUSINESS.whatsapp,
    instagram: (business as { instagram?: string }).instagram ?? DEFAULT_BUSINESS.instagram,
    email: (business as { email?: string }).email ?? "",
    address: (business as { address?: string }).address ?? "",
    google_review_url: (business as { google_review_url?: string }).google_review_url ?? "",
  };
}

export async function getBookingSettings(): Promise<BookingSettings> {
  return fetchSetting("booking", DEFAULT_BOOKING);
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  return fetchSetting("payment", DEFAULT_PAYMENT);
}

export async function getServiceSettings(): Promise<ServiceSettings> {
  return fetchSetting("service", DEFAULT_SERVICE);
}

export async function getAllSettings() {
  const [business, booking, payment, service] = await Promise.all([
    getSiteSettings(),
    getBookingSettings(),
    getPaymentSettings(),
    getServiceSettings(),
  ]);

  return { business, booking, payment, service };
}

export async function updateSiteSetting(
  key: string,
  value: Record<string, unknown>,
  adminId: string,
) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("site_settings").upsert({
    key,
    value,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);

  await logAudit(adminId, "update", "site_settings", null, { key, value });
}

export async function logAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    const supabase = createAdminClient();
    await supabase.from("audit_logs").insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });
  } catch (err) {
    console.warn("[audit] log failed:", err);
  }
}
