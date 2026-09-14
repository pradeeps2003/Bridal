import { NextResponse } from "next/server";

import { getSlotsForDate } from "@/lib/data/availability";
import { availabilityQuerySchema } from "@/lib/booking/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    date: searchParams.get("date"),
    package_id: searchParams.get("package_id"),
    location_type: searchParams.get("location_type") || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const slots = await getSlotsForDate(
      parsed.data.date,
      parsed.data.package_id,
      parsed.data.location_type ?? "home",
    );
    return NextResponse.json({ data: slots }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400",
      },
    });
  } catch (err) {
    console.error("[availability] error:", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
