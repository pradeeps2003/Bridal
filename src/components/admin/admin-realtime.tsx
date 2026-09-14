"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { tryCreateClient } from "@/lib/supabase/client";

export function AdminRealtime({ eventDate }: { eventDate?: string }) {
  const router = useRouter();
  const routerRef = useRef(router);
  const [state, setState] = useState<"connected" | "paused">("paused");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Keep ref in sync without triggering effect re-runs
  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    const supabase = tryCreateClient();
    if (!supabase) return;

    let refreshTimer = 0;
    const refreshSoon = () => {
      window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        setLastUpdated(new Date());
        routerRef.current.refresh();
      }, 2500);
    };

    const bookingFilter = eventDate
      ? { event: "*" as const, schema: "public", table: "bookings", filter: `event_date=eq.${eventDate}` }
      : { event: "*" as const, schema: "public", table: "bookings" };

    const channel = supabase
      .channel(`admin-live-${eventDate ?? "all"}`)
      .on("postgres_changes", bookingFilter, refreshSoon)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        refreshSoon,
      )
      .subscribe((status) => setState(status === "SUBSCRIBED" ? "connected" : "paused"));

    return () => {
      window.clearTimeout(refreshTimer);
      void supabase.removeChannel(channel);
    };
  }, [eventDate]);

  return (
    <span className="text-[10px] text-[var(--color-muted-foreground)]" aria-live="polite">
      {state === "connected"
        ? `Live updates${lastUpdated ? ` · ${lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`
        : "Updates paused. Reconnecting…"}
    </span>
  );
}
