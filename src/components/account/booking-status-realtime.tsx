"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { StatusTrack } from "@/components/account/status-track";
import { StatusBadge } from "@/components/booking/payment-button";
import { tryCreateClient } from "@/lib/supabase/client";
import type { BookingStatus } from "@/types";

interface BookingStatusRealtimeProps {
  bookingId: string;
  initialStatus: BookingStatus;
  initialBalance?: number;
  showTrack?: boolean;
  children?: (status: BookingStatus) => React.ReactNode;
}

export function BookingStatusRealtime({
  bookingId,
  initialStatus,
  initialBalance,
  showTrack = false,
  children,
}: BookingStatusRealtimeProps) {
  const [status, setStatus] = useState<BookingStatus>(initialStatus);
  const statusRef = useRef(initialStatus);
  const balanceRef = useRef(initialBalance);
  const router = useRouter();
  const [connection, setConnection] = useState<"connected" | "paused">("paused");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const supabase = tryCreateClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`customer-booking-${bookingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings", filter: `id=eq.${bookingId}` },
        (payload) => {
          const nextStatus = payload.new.status as BookingStatus;
          if (nextStatus && nextStatus !== statusRef.current) {
            statusRef.current = nextStatus;
            setStatus(nextStatus);
            setAnnouncement(`Booking status updated to ${nextStatus.replaceAll("_", " ")}.`);
          }

          const nextBalance = Number(payload.new.balance);
          if (Number.isFinite(nextBalance) && nextBalance !== balanceRef.current) {
            balanceRef.current = nextBalance;
            router.refresh();
          }
        },
      )
      .subscribe((state) => {
        setConnection(state === "SUBSCRIBED" ? "connected" : "paused");
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [bookingId, initialBalance, router]);

  return (
    <>
      {children ? children(status) : <StatusBadge status={status} />}
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <p className="mt-3 text-[10px] text-[var(--color-muted-foreground)]" aria-live="polite">
        {connection === "connected" ? "Live updates on" : "Updates paused. Reconnecting…"}
      </p>
      {showTrack && <StatusTrack status={status} />}
    </>
  );
}
