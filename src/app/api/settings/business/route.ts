import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data/settings";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(settings, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600, stale-if-error=86400",
      },
    });
  } catch (error) {
    console.error("Failed to fetch business settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}