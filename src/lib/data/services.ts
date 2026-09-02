import { SEED_SERVICES } from "@/lib/data/seed";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Service } from "@/types";

export async function getActiveServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) {
    return SEED_SERVICES.filter((s) => s.is_active);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("services")
      .select("id, name, slug, description, is_active, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data?.length) {
      console.warn("[services] Supabase fetch failed, using seed:", error?.message);
      return SEED_SERVICES.filter((s) => s.is_active);
    }

    return data as Service[];
  } catch (err) {
    console.warn("[services] Supabase unavailable, using seed:", err);
    return SEED_SERVICES.filter((s) => s.is_active);
  }
}

export async function getServiceBySlug(slug: string): Promise<Service | null> {
  const services = await getActiveServices();
  return services.find((s) => s.slug === slug) ?? null;
}

export async function getAllServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return SEED_SERVICES;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("services")
      .select("id, name, slug, description, is_active, display_order")
      .order("display_order");

    return (data as Service[]) ?? SEED_SERVICES;
  } catch {
    return SEED_SERVICES;
  }
}
