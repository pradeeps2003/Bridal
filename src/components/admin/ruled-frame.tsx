import { cn } from "@/lib/utils";

export function RuledFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("border border-[var(--color-border)] bg-[var(--color-card)]", className)}>{children}</section>;
}
