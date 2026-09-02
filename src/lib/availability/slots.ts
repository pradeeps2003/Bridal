import { addHoursToTime, timeToMinutes } from "@/lib/pricing/calculate";
import type { TimeSlot } from "@/types";

export interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface BlockedSlot {
  blocked_date: string;
  start_time: string;
  end_time: string;
}

export interface ExistingBooking {
  event_date: string;
  start_time: string;
  end_time: string;
  status: string;
}

const ACTIVE_STATUSES = new Set([
  "HELD",
  "ADMIN_APPROVED",
  "PAYMENT_PENDING",
  "CONFIRMED",
]);

function localDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
  buffer: number,
): boolean {
  return startA < endB + buffer && endA + buffer > startB;
}

export function getAvailableSlots(options: {
  date: string;
  durationMinutes: number;
  bufferMinutes: number;
  slotIntervalMinutes?: number;
  minAdvanceHours: number;
  rules: AvailabilityRule[];
  blockedDates: string[];
  blockedSlots: BlockedSlot[];
  existingBookings: ExistingBooking[];
  now?: Date;
}): TimeSlot[] {
  const {
    date,
    durationMinutes,
    bufferMinutes,
    slotIntervalMinutes = 30,
    minAdvanceHours,
    rules,
    blockedDates,
    blockedSlots,
    existingBookings,
    now = new Date(),
  } = options;

  if (blockedDates.includes(date)) return [];

  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const dayRules = rules.filter((r) => r.day_of_week === dayOfWeek && r.is_active);
  if (!dayRules.length) return [];

  const activeBookings = existingBookings.filter(
    (b) => b.event_date === date && ACTIVE_STATUSES.has(b.status),
  );

  const dayBlockedSlots = blockedSlots.filter((s) => s.blocked_date === date);
  const slots: TimeSlot[] = [];

  const minBookable = new Date(now.getTime() + minAdvanceHours * 60 * 60 * 1000);
  const minDateStr = localDateString(minBookable);
  if (date < minDateStr) return [];

  for (const rule of dayRules) {
    const windowStart = timeToMinutes(rule.start_time.slice(0, 5));
    const windowEnd = timeToMinutes(rule.end_time.slice(0, 5));

    for (let start = windowStart; start + durationMinutes <= windowEnd; start += slotIntervalMinutes) {
      const end = start + durationMinutes;
      const startTime = `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}:00`;
      const endTime = addHoursToTime(startTime.slice(0, 5), durationMinutes / 60);

      if (date === minDateStr) {
        const slotDate = new Date(`${date}T${startTime.slice(0, 5)}:00`);
        if (slotDate < minBookable) continue;
      }

      const blockedBySlot = dayBlockedSlots.some((bs) =>
        rangesOverlap(
          start,
          end,
          timeToMinutes(bs.start_time.slice(0, 5)),
          timeToMinutes(bs.end_time.slice(0, 5)),
          0,
        ),
      );

      const blockedByBooking = activeBookings.some((b) =>
        rangesOverlap(
          start,
          end,
          timeToMinutes(b.start_time.slice(0, 5)),
          timeToMinutes(b.end_time.slice(0, 5)),
          bufferMinutes,
        ),
      );

      slots.push({
        start_time: startTime,
        end_time: endTime,
        available: !blockedBySlot && !blockedByBooking,
      });
    }
  }

  return slots;
}
