import Link from "next/link";
import { Sparkles } from "lucide-react";

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--color-accent)]">
          <Sparkles className="h-5 w-5" aria-hidden="true" />
          <span className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-foreground)]">
            Glow with Rubi
          </span>
        </Link>
        <h1 className="mt-5 font-[family-name:var(--font-heading)] text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>
      </div>
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-[0_20px_50px_hsl(345_40%_12%/0.08)] sm:p-8">
        {children}
      </div>
      {footer}
    </div>
  );
}
