"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone. Are you sure you want to permanently delete this item?",
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h2>
          <button
            title="Close"
            type="button"
            className="rounded-lg p-1 hover:bg-[var(--color-muted)] transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-[var(--color-muted-foreground)]" />
          </button>
        </div>
        
        <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
          {description}
        </p>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
