import { NextResponse } from "next/server";

import { expireHeldBookings } from "@/lib/data/bookings";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await expireHeldBookings();
  return NextResponse.json({ data: { expired_count: expired } });
}

export async function POST(request: Request) {
  return GET(request);
}
