"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className={`h-9 w-9 rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] flex items-center justify-center ${className ?? ""}`}
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative h-9 w-9 cursor-pointer rounded-full border border-[var(--color-border)] bg-[var(--color-muted)] flex items-center justify-center transition-all duration-200 hover:bg-[var(--color-accent)]/10 hover:border-[var(--color-accent)]/40 ${className ?? ""}`}
    >
      <Sun
        className={`h-4 w-4 text-[var(--color-accent)] absolute transition-all duration-300 ${
          isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`h-4 w-4 text-[var(--color-accent)] absolute transition-all duration-300 ${
          isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
        }`}
      />
    </button>
  );
}
