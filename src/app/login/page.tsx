import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { tryCreateClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Login | Glow with Rubi",
  description: "Sign in to your account to view your bookings and manage your appointments.",
};

type PageProps = {
  searchParams: Promise<{ registered?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;
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
          <div className="mx-auto max-w-md">
            <div className="mb-8 text-center">
              <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                Sign in to view your bookings and manage your appointments
              </p>
            </div>

            {params.registered === "1" && (
              <p className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                Account created. Confirm your email if prompted, then sign in to continue.
              </p>
            )}

            {!supabase && (
              <p className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm text-[var(--color-muted-foreground)]">
                Client login is not connected yet. You can still book as a guest, or use studio login after Supabase keys are added to{" "}
                <code className="text-[var(--color-foreground)]">.env.local</code>.
              </p>
            )}

            <form action="/auth/signin" method="POST" className="space-y-4">
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
                  disabled={!supabase}
                  className="mt-1"
                />
              </div>
              <Button type="submit" variant="accent" className="w-full" disabled={!supabase}>
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[var(--color-accent)] hover:underline">
                Sign up
              </Link>
            </p>
            <p className="mt-3 text-center text-xs text-[var(--color-muted-foreground)]">
              Studio team?{" "}
              <Link href="/admin/login" className="underline hover:text-[var(--color-accent)]">
                Admin login is separate
              </Link>
            </p>

            <div className="mt-8 border-t border-[var(--color-border)] pt-8 text-center">
              <p className="mb-4 text-xs text-[var(--color-muted-foreground)]">
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
