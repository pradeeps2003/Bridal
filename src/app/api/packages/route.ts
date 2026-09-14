import { getActivePackages } from "@/lib/data/packages";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const packages = await getActivePackages({ limit: 200 });
    
    return new Response(JSON.stringify(packages), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=300", // Cache for 5 min on server and client
      },
    });
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch packages" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
