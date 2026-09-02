"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ThemeMode = "light" | "dark";

type ThemeToggleProps = {
  className?: string;
  /** Keep the existing compact icon presentation for the public header. */
  showLabels?: boolean;
  /** Reduce the labeled control width for compact mobile chrome. */
  compact?: boolean;
};

const THEME_OPTIONS: Array<{
  mode: ThemeMode;
  label: string;
  Icon: typeof Sun;
}> = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
];

function getDocumentTheme(): ThemeMode {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle({
  className,
  showLabels = false,
  compact = false,
}: ThemeToggleProps) {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const optionRefs = useRef<Record<ThemeMode, HTMLButtonElement | null>>({
    light: null,
    dark: null,
  });

  useEffect(() => {
    setTheme(getDocumentTheme());
  }, []);

  function selectTheme(nextTheme: ThemeMode) {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    try {
      window.localStorage.setItem("theme", nextTheme);
    } catch {
      // The current-page theme still applies when browser storage is unavailable.
    }
    setTheme(nextTheme);
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    currentTheme: ThemeMode,
  ) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const nextTheme = currentTheme === "light" ? "dark" : "light";
    selectTheme(nextTheme);
    optionRefs.current[nextTheme]?.focus();
  }

  if (!showLabels) {
    const Icon = theme === "dark" ? Sun : Moon;
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => selectTheme(theme === "dark" ? "light" : "dark")}
        className={cn(
          "h-10 w-10 rounded-full text-(--color-foreground) hover:bg-(--color-muted)",
          className,
        )}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center gap-1 rounded-(--radius-lg) border border-(--color-border) bg-(--color-card) p-1",
        className,
      )}
      role="radiogroup"
      aria-label="Color theme"
    >
      {THEME_OPTIONS.map(({ mode, label, Icon }) => {
        const selected = theme === mode;
        return (
          <Button
            key={mode}
            ref={(element) => {
              optionRefs.current[mode] = element;
            }}
            type="button"
            variant="ghost"
            size="sm"
            role="radio"
            aria-checked={selected}
            data-theme-option={mode}
            onClick={() => selectTheme(mode)}
            onKeyDown={(event) => handleKeyDown(event, mode)}
            className={cn(
              "min-w-0 flex-1 rounded-(--radius-md) px-3 text-xs text-(--color-foreground) hover:bg-(--color-muted)",
              compact ? "h-10 px-2 text-[11px]" : "h-10",
              selected && "bg-(--color-primary) text-(--color-on-primary) hover:bg-(--color-primary) hover:text-(--color-on-primary)",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{label}</span>
          </Button>
        );
      })}
    </div>
  );
}
