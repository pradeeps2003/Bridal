"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { tryCreateClient } from "@/lib/supabase/client";

export function AdminRealtime({ eventDate }: { eventDate?: string }) {
  const router = useRouter();
  const [state, setState] = useState<"connected" | "paused">("paused");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const supabase = tryCreateClient();
    if (!supabase) return;
    const bookingFilter = eventDate
      ? { event: "*" as const, schema: "public", table: "bookings", filter: `event_date=eq.${eventDate}` }
      : { event: "*" as const, schema: "public", table: "bookings" };

    const channel = supabase
      .channel(`admin-live-${eventDate ?? "all"}`)
      .on("postgres_changes", bookingFilter, () => {
        setLastUpdated(new Date());
        router.refresh();
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        () => {
          setLastUpdated(new Date());
          router.refresh();
        },
      )
      .subscribe((status) => setState(status === "SUBSCRIBED" ? "connected" : "paused"));

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventDate, router]);

  return (
    <span className="text-[10px] text-[var(--color-muted-foreground)]" aria-live="polite">
      {state === "connected"
        ? `Live updates${lastUpdated ? ` · ${lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}`
        : "Updates paused. Reconnecting…"}
    </span>
  );
}
