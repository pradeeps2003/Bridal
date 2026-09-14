import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { SEED_PACKAGES } from "@/lib/data/seed";
import { getSupabasePublicConfig, isSupabaseConfigured } from "@/lib/supabase/config";
import type { Package, PricingType } from "@/types";

const PACKAGE_SELECT =
  "id, service_id, name, slug, description, image_url, price, pricing_type, duration_hours, is_active, display_order, package_items(label, display_order), services(slug)";
const PACKAGE_SELECT_WITH_TYPE =
  "id, service_id, name, slug, description, image_url, price, pricing_type, duration_hours, is_active, display_order, package_type, package_items(label, display_order), services(slug)";

function isMissingPackageType(error: { message?: string } | null) {
  return Boolean(error?.message?.includes("package_type"));
}

interface DbPackageRow {
  id: string;
  service_id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url?: string | null;
  price: number | string;
  pricing_type: PricingType;
  duration_hours: number;
  is_active: boolean;
  display_order: number;
  package_type?: Package["package_type"];
  package_items?: { label: string; display_order: number }[];
  services?: { slug: string } | { slug: string }[];
}

function createPackagesClient() {
  const config = getSupabasePublicConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }

  return createSupabaseClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function mapPackage(row: DbPackageRow): Package {
  const inclusions = row.package_items
    ?.sort((a, b) => a.display_order - b.display_order)
    .map((item) => item.label);

  return {
    id: row.id,
    service_id: row.service_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image_url: row.image_url ?? null,
    price: Number(row.price),
    pricing_type: row.pricing_type,
    duration_hours: row.duration_hours,
    is_active: row.is_active,
    display_order: row.display_order,
    package_type: row.package_type,
    inclusions: inclusions?.length ? inclusions : undefined,
  };
}

export async function getActivePackages(options?: {
  serviceSlug?: string;
  limit?: number;
}): Promise<Package[]> {
  if (!isSupabaseConfigured()) {
    let packages = SEED_PACKAGES.filter((p) => p.is_active);
    if (options?.serviceSlug) {
      const service = SEED_PACKAGES.find((p) => p.slug.includes(options.serviceSlug!));
      packages = packages.filter((p) =>
        p.slug.includes(options.serviceSlug!) || p.service_id.includes(options.serviceSlug!),
      );
      void service;
    }
    if (options?.limit) packages = packages.slice(0, options.limit);
    return packages;
  }

  try {
    const supabase = createPackagesClient();
    let query = supabase
      .from("packages")
      .select(PACKAGE_SELECT_WITH_TYPE)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (options?.serviceSlug) {
      query = query.eq("services.slug", options.serviceSlug);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const initial = await query;
    let data = initial.data as DbPackageRow[] | null;
    let error = initial.error;

    if (isMissingPackageType(error)) {
      let fallbackQuery = supabase
        .from("packages")
        .select(PACKAGE_SELECT)
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (options?.serviceSlug) {
        fallbackQuery = fallbackQuery.eq("services.slug", options.serviceSlug);
      }
      if (options?.limit) {
        fallbackQuery = fallbackQuery.limit(options.limit);
      }
      const retry = await fallbackQuery;
      data = retry.data as DbPackageRow[] | null;
      error = retry.error;
    }

    if (error) {
      console.warn("[packages] Supabase fetch failed, using seed:", error.message);
      let fallback = SEED_PACKAGES.filter((p) => p.is_active);
      if (options?.serviceSlug) {
        fallback = fallback.filter((p) => p.slug.includes(options.serviceSlug!));
      }
      if (options?.limit) fallback = fallback.slice(0, options.limit);
      return fallback;
    }

    return (data as DbPackageRow[]).map(mapPackage);
  } catch (err) {
    console.warn("[packages] Supabase unavailable, using seed:", err);
    let fallback = SEED_PACKAGES.filter((p) => p.is_active);
    if (options?.limit) fallback = fallback.slice(0, options.limit);
    return fallback;
  }
}

export async function getAllPackages(): Promise<Package[]> {
  if (!isSupabaseConfigured()) {
    return SEED_PACKAGES;
  }

  try {
    const supabase = createPackagesClient();
    const { data, error } = await supabase
      .from("packages")
      .select(
        "id, service_id, name, slug, description, image_url, price, pricing_type, duration_hours, is_active, display_order, package_items(label, display_order)",
      )
      .order("display_order", { ascending: true });

    if (error || !data?.length) {
      console.warn("[packages] Supabase fetch failed, using seed:", error?.message);
      return SEED_PACKAGES;
    }

    return (data as DbPackageRow[]).map(mapPackage);
  } catch {
    return SEED_PACKAGES;
  }
}

export async function getPackageBySlug(slug: string): Promise<Package | null> {
  if (!isSupabaseConfigured()) {
    return SEED_PACKAGES.find((p) => p.slug === slug) ?? null;
  }

  try {
    const supabase = createPackagesClient();
    const { data, error } = await supabase
      .from("packages")
      .select(
        "id, service_id, name, slug, description, image_url, price, pricing_type, duration_hours, is_active, display_order, package_items(label, display_order)",
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return SEED_PACKAGES.find((p) => p.slug === slug) ?? null;
    }

    return mapPackage(data as DbPackageRow);
  } catch {
    return SEED_PACKAGES.find((p) => p.slug === slug) ?? null;
  }
}
