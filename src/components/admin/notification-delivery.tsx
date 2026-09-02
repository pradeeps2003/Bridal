import { StatusMark } from "@/components/admin/status-mark";
import type { DeliveryLog } from "@/lib/notifications/types";
import { CheckCircle2, Clock, XCircle, Mail, MessageSquare, Phone } from "lucide-react";

function getChannelIcon(channel: string) {
  switch (channel.toLowerCase()) {
    case "email":
      return <Mail className="h-4 w-4" />;
    case "whatsapp":
      return <MessageSquare className="h-4 w-4" />;
    case "sms":
      return <Phone className="h-4 w-4" />;
    default:
      return null;
  }
}

export function NotificationDelivery({ delivery }: { delivery: DeliveryLog[] }) {
  const delivered = delivery.filter((event) => event.status === "SENT").length;
  const sending = delivery.filter((event) => event.status === "PENDING").length;
  const failed = delivery.filter((event) => event.status === "FAILED").length;
  const total = delivery.length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-500/10 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-muted-foreground)]">Delivered</p>
              <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl tabular-nums">{delivered}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-yellow-500/10 p-2">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-muted-foreground)]">Sending</p>
              <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl tabular-nums">{sending}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-500/10 p-2">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-muted-foreground)]">Failed</p>
              <p className="mt-1 font-[family-name:var(--font-heading)] text-2xl tabular-nums">{failed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Log */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Activity</h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">{total} total events</p>
          </div>
        </div>
        
        {delivery.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-[var(--color-muted-foreground)]">No delivery events recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {delivery.map((event) => (
              <div 
                key={event.id} 
                className="grid gap-3 px-4 py-3 text-xs sm:grid-cols-[100px_1fr_120px_140px] sm:items-center hover:bg-[var(--color-muted)]/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-[var(--color-muted)]/50 p-1.5">
                    {getChannelIcon(event.channel)}
                  </div>
                  <span className="font-medium capitalize">{event.channel}</span>
                </div>
                
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {event.customerName ?? event.recipientEmail ?? event.recipientPhone ?? "—"}
                  </p>
                  {event.customerName && (event.recipientEmail || event.recipientPhone) && (
                    <p className="truncate text-[10px] text-[var(--color-muted-foreground)]">
                      {event.recipientEmail ?? event.recipientPhone}
                    </p>
                  )}
                </div>
                
                <div>
                  <StatusMark 
                    status={event.status === "SENT" ? "DELIVERED" : event.status === "PENDING" ? "SENDING" : "FAILED"} 
                  />
                </div>
                
                <time 
                  dateTime={event.sentAt ?? event.createdAt} 
                  className="text-[var(--color-muted-foreground)] tabular-nums"
                >
                  {new Date(event.sentAt ?? event.createdAt).toLocaleString("en-IN", { 
                    dateStyle: "short", 
                    timeStyle: "short" 
                  })}
                </time>
                
                {event.error && (
                  <div className="col-span-full sm:col-span-4 mt-2">
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2 dark:bg-red-900/20 dark:border-red-800">
                      <p className="text-[10px] sm:text-xs text-red-700 dark:text-red-400 font-medium">Error: {event.error}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
