import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { PortfolioCategory, PortfolioItem } from "@/types";

export async function getPublishedPortfolio(
  category?: PortfolioCategory,
): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  let query = supabase
    .from("portfolio_items")
    .select("id, title, category, image_url, video_url, is_published, display_order")
    .eq("is_published", true)
    .order("display_order");

  if (category) query = query.eq("category", category);

  const { data } = await query;
  return (data ?? []) as PortfolioItem[];
}

export async function getAllPortfolioItems(): Promise<PortfolioItem[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("portfolio_items")
    .select("*")
    .order("display_order");

  return (data ?? []) as PortfolioItem[];
}
