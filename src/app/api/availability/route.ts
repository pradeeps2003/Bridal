import { NextResponse } from "next/server";

import { getSlotsForDate } from "@/lib/data/availability";
import { availabilityQuerySchema } from "@/lib/booking/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    date: searchParams.get("date"),
    package_id: searchParams.get("package_id"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const slots = await getSlotsForDate(parsed.data.date, parsed.data.package_id);
    return NextResponse.json({ data: slots });
  } catch (err) {
    console.error("[availability] error:", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
