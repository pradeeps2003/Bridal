import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_AUTH_IMAGES, DEFAULT_FOOTER_IMAGE_URLS, DEFAULT_HERO_IMAGE_URLS } from "@/lib/brand-media";
import { getSupabasePublicConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  AboutSettings,
  BookingSettings,
  CheckoutSettings,
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
  address: "Vettaikaranpudur, Pollachi, Coimbatore district, Tamil Nadu",
  google_review_url: "",
  admin_login_image_url: DEFAULT_AUTH_IMAGES.admin,
  hero_image_urls: [...DEFAULT_HERO_IMAGE_URLS],
  footer_image_urls: [...DEFAULT_FOOTER_IMAGE_URLS],
  featured_package_ids: [],
};

const DEFAULT_BOOKING: BookingSettings = {
  min_advance_hours: 48,
  hold_duration_hours: 0.25,
  buffer_hours: 0.5,
  travel_buffer_hours: 2,
  cancellation_policy:
    "You can cancel anytime. If advance was paid, the studio decides any refund. Less than 7 days before the event: no advance return unless the studio chooses otherwise. Remaining balance is collected on the event day.",
};

const DEFAULT_PAYMENT: PaymentSettings = {
  mode: "ADVANCE_PERCENTAGE",
  advance_percentage: 30,
  fixed_advance: 2000,
};

const DEFAULT_SERVICE: ServiceSettings = {
  home_service_enabled: true,
  travel_charge_base: 0,
  travel_charge_per_km: 0,
  travel_radius_km: 50,
  long_distance_fixed_fee: 1000,
};

const DEFAULT_CHECKOUT: CheckoutSettings = {
  coupons_enabled: true,
};

const DEFAULT_ABOUT: AboutSettings = {
  badge: "The artist",
  title: "Timeless artistry, intentionally crafted",
  description: "Rubi Sen specializes in skin-first bridal makeup that photographs beautifully.",
  artist_label: "Meet the artist",
  artist_name: "Nithiya Rubini",
  artist_statement: "Makeup is not a mask. It is a refinement of light, texture, and character.",
  body: "With over three years in luxury bridal work, We’re known for our skin-first approach to bridal makeup. We focus on colour correction and light placement. Looks are built around wardrobe, jewellery, and venue lighting.",
  artist_image_url: null,
  pillars: [
    { title: "Skin inclusivity", copy: "Custom blends for every tone and texture. No ashiness, no oxidation." },
    { title: "Certified training", copy: "HD and airbrush techniques, built for ceremony light and evening photos." },
    { title: "Calm presence", copy: "A grounded dressing-room energy so the morning stays serene." },
  ],
};

async function fetchSetting<T>(key: string, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;

  try {
    const config = getSupabasePublicConfig();
    if (!config) return fallback;
    const supabase = createSupabaseClient(config.url, config.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
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

function normalizeImageUrls(value: unknown, fallback: readonly string[]) {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
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
    admin_login_image_url: DEFAULT_BUSINESS.admin_login_image_url,
    hero_image_urls: DEFAULT_BUSINESS.hero_image_urls,
    footer_image_urls: DEFAULT_BUSINESS.footer_image_urls,
  });

  const heroImageUrls = normalizeImageUrls(
    (business as { hero_image_urls?: unknown }).hero_image_urls,
    DEFAULT_HERO_IMAGE_URLS,
  );
  const footerImageUrls = normalizeImageUrls(
    (business as { footer_image_urls?: unknown }).footer_image_urls,
    heroImageUrls,
  );

  const featuredIds = Array.isArray((business as { featured_package_ids?: unknown }).featured_package_ids)
    ? ((business as { featured_package_ids?: string[] }).featured_package_ids ?? [])
    : [];

  return {
    business_name: (business as { name?: string }).name ?? DEFAULT_BUSINESS.business_name,
    phone: (business as { phone?: string }).phone || DEFAULT_BUSINESS.phone,
    whatsapp: (business as { whatsapp?: string }).whatsapp || DEFAULT_BUSINESS.whatsapp,
    instagram: (business as { instagram?: string }).instagram ?? DEFAULT_BUSINESS.instagram,
    email: (business as { email?: string }).email ?? "",
    address: (business as { address?: string }).address ?? "",
    google_review_url: (business as { google_review_url?: string }).google_review_url ?? "",
    admin_login_image_url:
      typeof (business as { admin_login_image_url?: unknown }).admin_login_image_url === "string"
        ? ((business as { admin_login_image_url?: string }).admin_login_image_url ?? DEFAULT_BUSINESS.admin_login_image_url)
        : DEFAULT_BUSINESS.admin_login_image_url,
    hero_image_urls: heroImageUrls,
    footer_image_urls: footerImageUrls,
    featured_package_ids: featuredIds,
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

export async function getCheckoutSettings(): Promise<CheckoutSettings> {
  const checkout = await fetchSetting("checkout", DEFAULT_CHECKOUT);
  return { coupons_enabled: checkout.coupons_enabled !== false };
}

export async function getAboutSettings(): Promise<AboutSettings> {
  const about = await fetchSetting("about", DEFAULT_ABOUT);
  const pillars = Array.isArray(about.pillars)
    ? about.pillars.slice(0, 3).map((pillar, index) => ({
        title: typeof pillar?.title === "string" && pillar.title.trim()
          ? pillar.title
          : DEFAULT_ABOUT.pillars[index].title,
        copy: typeof pillar?.copy === "string" ? pillar.copy : DEFAULT_ABOUT.pillars[index].copy,
      }))
    : DEFAULT_ABOUT.pillars;

  return {
    badge: typeof about.badge === "string" ? about.badge : DEFAULT_ABOUT.badge,
    title: typeof about.title === "string" ? about.title : DEFAULT_ABOUT.title,
    description: typeof about.description === "string" ? about.description : DEFAULT_ABOUT.description,
    artist_label: typeof about.artist_label === "string" ? about.artist_label : DEFAULT_ABOUT.artist_label,
    artist_name: typeof about.artist_name === "string" ? about.artist_name : DEFAULT_ABOUT.artist_name,
    artist_statement: typeof about.artist_statement === "string" ? about.artist_statement : DEFAULT_ABOUT.artist_statement,
    body: typeof about.body === "string" ? about.body : DEFAULT_ABOUT.body,
    artist_image_url: typeof about.artist_image_url === "string" ? about.artist_image_url : DEFAULT_ABOUT.artist_image_url,
    pillars: pillars.length === 3 ? pillars : DEFAULT_ABOUT.pillars,
  };
}

export async function getAllSettings() {
  const [business, booking, payment, service, checkout] = await Promise.all([
    getSiteSettings(),
    getBookingSettings(),
    getPaymentSettings(),
    getServiceSettings(),
    getCheckoutSettings(),
  ]);

  return { business, booking, payment, service, checkout };
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
