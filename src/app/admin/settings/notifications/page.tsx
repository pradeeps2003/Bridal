import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { NotificationDelivery } from "@/components/admin/notification-delivery";
import { getNotificationDelivery } from "@/lib/data/notifications";

export const dynamic = "force-dynamic";

export default async function AdminNotificationSettingsPage() {
  const delivery = await getNotificationDelivery(100);

  return (
    <AdminShell>
      <div className="space-y-4">
        <div>
          <Link href="/admin/settings" className="text-xs text-[var(--color-accent)] hover:underline">← Settings</Link>
          <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl">Notification Delivery</h1>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[var(--color-muted-foreground)]">WhatsApp is primary. Email backs up failed or unavailable WhatsApp delivery, and SMS is reserved for critical status changes.</p>
        </div>
        <NotificationDelivery delivery={delivery} />
      </div>
    </AdminShell>
  );
}
