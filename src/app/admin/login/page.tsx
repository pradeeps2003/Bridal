import { Suspense } from "react";

import { AdminLoginForm } from "@/components/admin/login-form";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-background) px-4 py-6 sm:py-8">
      <div className="w-full max-w-md">
        <div className="flex min-h-14 items-center justify-end">
          <ThemeToggle />
        </div>

        <div className="space-y-8 rounded-(--radius-lg) border border-(--color-border) bg-(--color-card) p-6 shadow-lg sm:p-8">
        <div className="text-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[var(--color-accent)]"
          >
            ✨ Glow with Rubi
          </Link>
          <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">Admin dashboard — not the client login</p>
        </div>

        <Suspense fallback={<p className="text-center text-sm text-[var(--color-muted-foreground)]">Loading…</p>}>
          <AdminLoginForm />
        </Suspense>

        <div className="border-t border-[var(--color-border)] pt-6">
          <p className="text-center text-xs text-[var(--color-muted-foreground)]">
            Clients should use {" "}
            <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
              /login
            </Link>
            .{" "}
            <Link href="/" className="font-medium text-[var(--color-accent)] hover:underline">
              Back to website
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
