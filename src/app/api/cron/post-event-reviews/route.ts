import { NextResponse } from "next/server";

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

  const result = await sendDueReviewRequests();
  return NextResponse.json({ data: result });
}

export async function POST(request: Request) {
  return GET(request);
}
