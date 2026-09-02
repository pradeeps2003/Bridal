"use client";

import { useEffect, useRef } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  open: boolean;
  title: string;
  message: string;
  tone?: "error" | "success" | "info";
  onClose: () => void;
}

export function FeedbackDialog({
  open,
  title,
  message,
  tone = "error",
  onClose,
}: FeedbackDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  const Icon = tone === "success" ? CircleCheck : tone === "info" ? CircleAlert : CircleAlert;
  const iconClass = tone === "success"
    ? "text-emerald-700 dark:text-emerald-300"
    : tone === "info"
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-destructive)]";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="feedback-dialog-title"
        aria-describedby="feedback-dialog-message"
        className="w-full max-w-md rounded-sm border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", iconClass)} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <h2 id="feedback-dialog-title" className="font-[family-name:var(--font-heading)] text-xl">
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close message"
                className="rounded-sm p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p id="feedback-dialog-message" className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {message}
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-5" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
