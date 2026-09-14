"use client";

import { useActionState } from "react";
import Link from "next/link";

import { AUTH_IMAGES, AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/app/auth/password-actions";

const initialState = { error: null as string | null, success: false };

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <AuthSplitScreen
      title="Reset your password"
      description="We’ll email a reset link if that account exists."
      imageSrc={AUTH_IMAGES.reset}
      imageAlt="Soft glam makeup"
      footer={
        <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {state.success ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm">
          If that email is registered, a reset link is on its way. Check spam if you don’t see it.
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required className="mt-1.5" />
          </div>
          {state.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              {state.error}
            </p>
          ) : null}
          <Button type="submit" variant="accent" className="h-12 w-full" loading={isPending}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthSplitScreen>
  );
}
