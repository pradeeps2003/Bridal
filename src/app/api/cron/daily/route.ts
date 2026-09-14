import { NextResponse } from "next/server";
import { GET as runBookingReminders } from "@/app/api/cron/booking-reminders/route";
import { expireHeldBookings } from "@/lib/data/bookings";
import { sendDueReviewRequests } from "@/lib/notifications/reviews";
import { autoCaptureOverdueBalances } from "@/lib/payments/confirm";

function authorize(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const expiredCount = await expireHeldBookings();
    const reviewResult = await sendDueReviewRequests();
    const autoBalances = await autoCaptureOverdueBalances();
    const reminderRes = await runBookingReminders(request);
    const reminders = await reminderRes.json().catch(() => null);

    return NextResponse.json({
      success: true,
      data: {
        expiredHolds: expiredCount,
        reviews: reviewResult,
        autoBalances,
        reminders,
      },
    });
  } catch (err) {
    console.error("[cron/daily] Error:", err);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
