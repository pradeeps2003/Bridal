import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  required?: boolean;
  className?: string;
  icon?: boolean;
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  min,
  max,
  required = false,
  className = "",
  icon = true,
}: DatePickerProps) {
  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="flex items-center gap-2 text-sm">
          {icon && <CalendarIcon className="h-3.5 w-3.5 text-[var(--color-accent)]" />}
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <Input
        id={id}
        type="date"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`text-sm ${className}`}
      />
    </div>
  );
}