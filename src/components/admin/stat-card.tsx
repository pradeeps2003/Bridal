import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-sm border border-[var(--color-border)] bg-[var(--color-card)] p-6",
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-3 font-[family-name:var(--font-heading)] text-4xl text-[var(--color-foreground)]">
        {value}
      </p>
      {hint && (
        <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">{hint}</p>
      )}
    </div>
  );
}

export function RevenueStatCard({ amount }: { amount: number }) {
  return (
    <StatCard
      label="Revenue captured"
      value={formatCurrency(amount)}
      hint="From confirmed payments"
    />
  );
}
