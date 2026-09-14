import { AUTH_IMAGES, AuthSplitScreen } from "@/components/auth/auth-split-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { tryCreateClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Login",
  description: "Sign in to view your bookings and manage your appointments.",
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
    <AuthSplitScreen
      title="Welcome back"
      description="Sign in to view bookings and manage appointments."
      imageSrc={AUTH_IMAGES.login}
      imageAlt="Bridal makeup close-up"
      footer={
        <div className="mt-8 space-y-3 text-sm text-[var(--color-muted-foreground)]">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-[var(--color-accent)] hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-xs">
            Studio team?{" "}
            <Link href="/admin/login" className="underline hover:text-[var(--color-accent)]">
              Use admin login
            </Link>
          </p>
        </div>
      }
    >
      {params.registered === "1" && (
        <p className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm">
          Account created. Confirm your email if prompted, then sign in.
        </p>
      )}
      {!supabase && (
        <p className="mb-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-muted)] px-4 py-3 text-sm">
          Client login is not connected yet. You can still book as a guest.
        </p>
      )}
      <form action="/auth/signin" method="POST" className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@email.com"
            required
            disabled={!supabase}
            className="mt-1.5"
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-[var(--color-accent)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={!supabase}
          />
        </div>
        <Button type="submit" variant="accent" className="h-12 w-full" disabled={!supabase}>
          Sign in
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
