import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No items found",
  description = "Get started by creating a new item.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card)] p-8 text-center animate-in fade-in-50",
        className
      )}
    >
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-muted)] mb-4">
        {icon ? icon : <FolderOpen className="h-10 w-10 text-[var(--color-muted-foreground)]" />}
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-heading)] text-xl sm:text-2xl font-semibold text-[var(--color-foreground)]">
        {title}
      </h3>
      <p className="mt-2 mb-6 max-w-sm text-sm sm:text-base text-[var(--color-muted-foreground)]">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
