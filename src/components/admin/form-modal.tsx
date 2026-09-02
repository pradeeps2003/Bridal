"use client";

import { ReactNode, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormModalProps {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
  onSubmit?: () => void;
}

export function FormModal({ title, description, trigger, children }: FormModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-[var(--color-card)] shadow-lg border border-[var(--color-border)]">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-6 py-4 z-10">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold">{title}</h2>
                {description && <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{description}</p>}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 hover:bg-[var(--color-muted)]/50 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {typeof children === "function"
                ? (children as (closeModal: () => void) => ReactNode)(
                    () => setOpen(false)
                  )
                : children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
