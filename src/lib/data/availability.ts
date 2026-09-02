import { getAvailableSlots, type AvailabilityRule } from "@/lib/availability/slots";
import { SEED_PACKAGES } from "@/lib/data/seed";
import { getBookingSettings } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TimeSlot } from "@/types";

const DEFAULT_RULES: AvailabilityRule[] = [0, 1, 2, 3, 4, 5, 6].map((day_of_week) => ({
  day_of_week,
  start_time: "00:00:00",
  end_time: "24:00:00",
  is_active: true,
}));

function durationForPackage(packageId: string) {
  const pkg = SEED_PACKAGES.find((p) => p.id === packageId || p.slug === packageId);
  return (pkg?.duration_hours ?? 2) * 60;
}

export async function getSlotsForDate(date: string, packageId: string): Promise<TimeSlot[]> {
  const bookingSettings = await getBookingSettings();
  let durationMinutes = durationForPackage(packageId);

  const fallback = () =>
    getAvailableSlots({
      date,
      durationMinutes,
      bufferMinutes: bookingSettings.buffer_hours * 60,
      minAdvanceHours: bookingSettings.min_advance_hours,
      rules: DEFAULT_RULES,
      blockedDates: [],
      blockedSlots: [],
      existingBookings: [],
    });

  if (!isSupabaseConfigured()) {
    return fallback();
  }

  try {
    const supabase = createAdminClient();
    const { data: pkgById } = await supabase
      .from("packages")
      .select("duration_hours")
      .eq("id", packageId)
      .maybeSingle();
    const { data: pkgBySlug } = pkgById
      ? { data: pkgById }
      : await supabase.from("packages").select("duration_hours").eq("slug", packageId).maybeSingle();
    const pkg = pkgById ?? pkgBySlug;

    if (pkg?.duration_hours) {
      durationMinutes = Number(pkg.duration_hours) * 60;
    }

    const [blockedDatesRes, blockedSlotsRes, bookingsRes] = await Promise.all([
      supabase.from("blocked_dates").select("blocked_date"),
      supabase.from("blocked_slots").select("blocked_date, start_time, end_time"),
      supabase.from("bookings").select("event_date, start_time, end_time, status").eq("event_date", date),
    ]);

    const rules = DEFAULT_RULES;

    return getAvailableSlots({
      date,
      durationMinutes,
      bufferMinutes: bookingSettings.buffer_hours * 60,
      minAdvanceHours: bookingSettings.min_advance_hours,
      rules,
      blockedDates: (blockedDatesRes.data ?? []).map((d) => d.blocked_date as string),
      blockedSlots: blockedSlotsRes.data ?? [],
      existingBookings: bookingsRes.data ?? [],
    });
  } catch (err) {
    console.warn("[availability] using local hours:", err);
    return fallback();
  }
}

export async function isSlotAvailable(
  date: string,
  startTime: string,
  packageId: string,
): Promise<boolean> {
  const normalized = startTime.length === 5 ? `${startTime}:00` : startTime;
  const slots = await getSlotsForDate(date, packageId);
  return slots.some((s) => s.start_time === normalized && s.available);
}
