import { NextResponse } from "next/server";
import { expireHeldBookings } from "@/lib/data/bookings";
import { sendDueReviewRequests } from "@/lib/notifications/reviews";

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

    return NextResponse.json({
      success: true,
      data: {
        expiredHolds: expiredCount,
        reviews: reviewResult,
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
