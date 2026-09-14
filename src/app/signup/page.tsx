import { AUTH_IMAGES, AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { tryCreateClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign Up",
  description: "Create an account to track your bookings.",
};

export default async function SignupPage() {
  const supabase = await tryCreateClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/account");
  }

  return (
    <AuthSplitScreen
      title="Create your account"
      description="Track bookings and pick up where you left off."
      imageSrc={AUTH_IMAGES.signup}
      imageAlt="Wedding day bridal look"
      imageQuote="Looks built for ceremony light, jewellery, and a long Tamil Nadu wedding day."
      footer={
        <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--color-accent)] hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      {!supabase && (
        <p className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm">
          Accounts are not connected yet. You can still book as a guest.
        </p>
      )}
      <form action="/auth/signup" method="POST" className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required disabled={!supabase} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+91"
            required
            disabled={!supabase}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={!supabase}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            disabled={!supabase}
            className="mt-1.5"
          />
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">At least 8 characters.</p>
        </div>
        <Button type="submit" variant="accent" className="h-12 w-full" disabled={!supabase}>
          Create account
        </Button>
      </form>
      <div className="mt-6 border-t border-[var(--color-border)] pt-5">
        <Button variant="outline" asChild className="h-11 w-full">
          <Link href="/book">Continue as guest</Link>
        </Button>
      </div>
    </AuthSplitScreen>
  );
}
