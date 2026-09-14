import { BrandLogo } from "@/components/brand/brand-logo";

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
        <BrandLogo className="justify-center" />
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
