"use client";

import { useActionState } from "react";
import Link from "next/link";

import { AUTH_IMAGES, AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction } from "@/app/auth/password-actions";

const initialState = { error: null as string | null, success: false };

export default function ResetPasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <AuthSplitScreen
      title="Choose a new password"
      description="Use at least 8 characters. Open this page from the email link."
      imageSrc={AUTH_IMAGES.reset}
      imageAlt="Occasion makeup styling"
      footer={
        <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {state.success ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm">
          Password updated. You can{" "}
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            sign in
          </Link>{" "}
          now.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              className="mt-1.5"
            />
          </div>
          {state.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" variant="accent" className="h-12 w-full" loading={isPending}>
            Update password
          </Button>
        </form>
      )}
    </AuthSplitScreen>
  );
}
