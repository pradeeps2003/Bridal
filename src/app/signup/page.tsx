import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { tryCreateClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign Up | Glow with Rubi",
  description: "Create an account to track your bookings and get personalized recommendations.",
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
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[var(--color-background)] pt-24 pb-16 lg:pt-32">
        <div className="container-narrow px-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl">
                Create Account
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                Join us to track your bookings and get personalized recommendations
              </p>
            </div>

            {!supabase && (
              <p className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                Accounts are not connected yet. Book as a guest, or add Supabase keys to{" "}
                <code className="text-[var(--color-foreground)]">.env.local</code>.
              </p>
            )}

            <form action="/auth/signup" method="POST" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  disabled={!supabase}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  disabled={!supabase}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Your Name"
                  required
                  disabled={!supabase}
                  className="mt-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 99999 88888"
                  required
                  disabled={!supabase}
                  className="mt-1"
                />
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={!supabase}>
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--color-accent)] hover:underline">
                Sign in
              </Link>
            </p>

            <div className="mt-8 pt-8 border-t border-[var(--color-border)] text-center">
              <p className="text-xs text-[var(--color-muted-foreground)] mb-4">
                Or continue as guest to book directly
              </p>
              <Button variant="outline" asChild className="w-full">
                <Link href="/book">Book as Guest</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}