import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface CompactFormProps {
  children: ReactNode;
  onSubmit?: (formData: FormData) => void | Promise<void>;
  submitText?: string;
  submitVariant?: "accent" | "outline" | "ghost";
  cancelText?: string;
  onCancel?: () => void;
  action?: (formData: FormData) => void | Promise<void>;
}

export function CompactForm({
  children,
  submitText = "Save",
  submitVariant = "accent",
  cancelText,
  onCancel,
  action,
}: CompactFormProps) {
  return (
    <form action={action} className="space-y-4">
      {children}
      <div className="flex gap-2 pt-2">
        <Button type="submit" variant={submitVariant} size="sm" className="flex-1">
          {submitText}
        </Button>
        {cancelText && onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
            {cancelText}
          </Button>
        )}
      </div>
    </form>
  );
}
