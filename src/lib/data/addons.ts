import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { addonPricingType } from "@/lib/addons/pricing";
import type { Addon } from "@/types";

const SEED_ADDONS: Addon[] = [
  {
    id: "extra-person",
    name: "Extra Person",
    slug: "extra-person",
    description: "Additional person makeup and styling.",
    price: 2500,
    pricing_type: "FIXED",
    is_active: true,
    display_order: 1,
  },
  {
    id: "hair-extension",
    name: "Hair Extension",
    slug: "hair-extension",
    description: "Quoted after we see hair length, volume, and the look. Not a fixed menu price.",
    price: 0,
    pricing_type: "CUSTOM_QUOTE",
    is_active: true,
    display_order: 2,
  },
  {
    id: "jewellery-setting",
    name: "Jewellery Setting",
    slug: "jewellery-setting",
    description: "Quoted based on jewellery weight and setting time.",
    price: 0,
    pricing_type: "CUSTOM_QUOTE",
    is_active: true,
    display_order: 3,
  },
  {
    id: "early-morning",
    name: "Early Morning Service",
    slug: "early-morning",
    description: "Service before 7 AM.",
    price: 1000,
    pricing_type: "FIXED",
    is_active: true,
    display_order: 4,
  },
  {
    id: "additional-draping",
    name: "Additional Draping",
    slug: "additional-draping",
    description: "Quoted based on extra outfits and draping time.",
    price: 0,
    pricing_type: "CUSTOM_QUOTE",
    is_active: true,
    display_order: 5,
  },
];

function mapAddon(row: {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | string;
  pricing_type?: string | null;
  is_active: boolean;
  display_order: number;
}): Addon {
  const addon: Addon = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    is_active: row.is_active,
    display_order: row.display_order,
  };
  addon.pricing_type = addonPricingType({
    ...addon,
    pricing_type: row.pricing_type as Addon["pricing_type"],
  });
  return addon;
}

export async function getActiveAddons(): Promise<Addon[]> {
  if (!isSupabaseConfigured()) return SEED_ADDONS;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("addons")
      .select("id, name, slug, description, price, pricing_type, is_active, display_order")
      .eq("is_active", true)
      .order("display_order");

    if (error) {
      const fallback = await supabase
        .from("addons")
        .select("id, name, slug, description, price, is_active, display_order")
        .eq("is_active", true)
        .order("display_order");
      if (fallback.error || !fallback.data?.length) return SEED_ADDONS;
      return fallback.data.map(mapAddon);
    }

    if (!data?.length) return SEED_ADDONS;
    return data.map(mapAddon);
  } catch {
    return SEED_ADDONS;
  }
}

export async function getAllAddons(): Promise<Addon[]> {
  if (!isSupabaseConfigured()) return SEED_ADDONS;

  const supabase = await createClient();
  const { data } = await supabase
    .from("addons")
    .select("*")
    .order("display_order");

  return (data ?? []).map((row) => mapAddon(row as Parameters<typeof mapAddon>[0]));
}

export async function getAddonsByIds(ids: string[]): Promise<Addon[]> {
  if (!ids.length) return [];

  if (!isSupabaseConfigured()) {
    return SEED_ADDONS.filter((a) => ids.includes(a.id));
  }

  const supabase = createAdminClient();
  const { data } = await supabase.from("addons").select("*").in("id", ids);
  return (data ?? []).map((row) => mapAddon(row as Parameters<typeof mapAddon>[0]));
}
