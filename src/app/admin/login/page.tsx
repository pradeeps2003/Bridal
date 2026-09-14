import { Suspense } from "react";
import Link from "next/link";

import { AdminLoginForm } from "@/components/admin/login-form";
import { AUTH_IMAGES, AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getSiteSettings } from "@/lib/data/settings";

export default async function AdminLoginPage() {
  const settings = await getSiteSettings();

  return (
    <AuthSplitScreen
      title="Studio login"
      description="Owner dashboard. Clients use the public login."
      imageSrc={settings.admin_login_image_url || AUTH_IMAGES.admin}
      imageAlt="Studio makeup styling"
      imageKicker="Studio"
      imageQuote="The dressing-room view — bookings, looks, and the calendar in one place."
      headerRight={<ThemeToggle />}
      footer={
        <p className="mt-8 text-xs text-[var(--color-muted-foreground)]">
          <Link href="/login" className="text-[var(--color-accent)] hover:underline">
            Client login
          </Link>
          {" · "}
          <Link href="/" className="hover:underline">
            Website
          </Link>
        </p>
      }
    >
      <Suspense fallback={<p className="text-sm text-[var(--color-muted-foreground)]">Loading…</p>}>
        <AdminLoginForm />
      </Suspense>
    </AuthSplitScreen>
  );
}
