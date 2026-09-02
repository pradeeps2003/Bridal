import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Booking, BookingStatus } from "@/types";

export async function getBookings(filters?: {
  status?: BookingStatus[];
  fromDate?: string;
  toDate?: string;
  limit?: number;
}): Promise<Booking[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select(
      "*, customers(id, full_name, phone, email, whatsapp), packages(id, name, slug), services(id, name, slug)",
    )
    .order("event_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (filters?.status?.length) {
    query = query.in("status", filters.status);
  }
  if (filters?.fromDate) query = query.gte("event_date", filters.fromDate);
  if (filters?.toDate) query = query.lte("event_date", filters.toDate);
  if (filters?.limit) query = query.limit(filters.limit);

  const { data } = await query;
  return (data ?? []) as Booking[];
}

export async function getCustomerBookings(userId: string): Promise<Booking[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("auth_user_id", userId)
      .maybeSingle();
    if (!customer?.id) return [];

    const { data } = await supabase
      .from("bookings")
      .select(
        "*, customers(id, full_name, phone, email, whatsapp), packages(id, name, slug, price, pricing_type, duration_hours), services(id, name, slug)",
      )
      .eq("customer_id", customer.id)
      .order("event_date", { ascending: false })
      .order("start_time", { ascending: false });

    return (data ?? []) as Booking[];
  } catch (error) {
    console.warn("[account] customer bookings fetch failed:", error);
    return [];
  }
}

export async function getBookingById(id: string): Promise<Booking | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "*, customers(id, full_name, phone, email, whatsapp), packages(id, name, slug, price, pricing_type), services(id, name, slug)",
    )
    .eq("id", id)
    .single();

  return (data as Booking) ?? null;
}

export async function getPublicBooking(id: string): Promise<Booking | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select(
      "id, status, event_date, start_time, end_time, total, advance, balance, location_type, notes, packages(name, pricing_type), services(name), customers(full_name, phone, whatsapp)",
    )
    .eq("id", id)
    .single();

  return (data as unknown as Booking) ?? null;
}

export async function expireHeldBookings(): Promise<number> {
  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: expired } = await supabase
    .from("bookings")
    .select("id")
    .eq("status", "HELD")
    .lt("hold_expires_at", now);

  if (!expired?.length) return 0;

  const ids = expired.map((b) => b.id);
  await supabase.from("bookings").update({ status: "EXPIRED" }).in("id", ids);

  return ids.length;
}

export async function getCalendarBookings(month: string): Promise<Booking[]> {
  const start = `${month}-01`;
  const endDate = new Date(`${month}-01`);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(0);
  const end = endDate.toISOString().slice(0, 10);

  return getBookings({ fromDate: start, toDate: end });
}

export async function getEnquiries() {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getUnreadEnquiryCount() {
  if (!isSupabaseConfigured()) return 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    return count ?? 0;
  } catch {
    return 0;
  }
}
