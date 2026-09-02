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
  autoClose?: boolean;
  autoCloseDuration?: number;
  onClose: () => void;
}

export function FeedbackDialog({
  open,
  title,
  message,
  tone = "error",
  autoClose = true,
  autoCloseDuration = 5000,
  onClose,
}: FeedbackDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    let timer: NodeJS.Timeout | null = null;
    if (autoClose && autoCloseDuration > 0) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDuration);
    }

    previousFocus.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose, open, autoClose, autoCloseDuration]);

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
        className="relative overflow-hidden w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-start gap-4">
          <Icon className={cn("mt-0.5 h-6 w-6 shrink-0", iconClass)} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <h2 id="feedback-dialog-title" className="font-[family-name:var(--font-heading)] text-xl font-semibold">
                {title}
              </h2>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Close message"
                className="rounded-md p-1 text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <p id="feedback-dialog-message" className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {message}
            </p>
            <div className="mt-5 flex items-center justify-between gap-2">
              {autoClose && autoCloseDuration > 0 && (
                <span className="text-[11px] text-[var(--color-muted-foreground)] font-medium">
                  Auto-closing in {Math.round(autoCloseDuration / 1000)}s...
                </span>
              )}
              <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onClose}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>

        {/* 5-second animated progress bar */}
        {autoClose && autoCloseDuration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-muted)]/30">
            <div
              className={cn(
                "h-full transition-all ease-linear",
                tone === "success" ? "bg-emerald-500" : tone === "info" ? "bg-[var(--color-accent)]" : "bg-red-500"
              )}
              style={{
                animation: `shrinkWidth ${autoCloseDuration}ms linear forwards`,
              }}
            />
            <style jsx>{`
              @keyframes shrinkWidth {
                from { width: 100%; }
                to { width: 0%; }
              }
            `}</style>
          </div>
        )}
      </div>
    </div>
  );
}
