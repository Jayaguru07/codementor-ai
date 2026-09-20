"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={cn(
        "relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
        "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
        "hover:scale-105 active:scale-95",
        className
      )}
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Sun icon (shown in dark mode to switch to light) */}
      <Sun
        size={15}
        className={cn(
          "absolute transition-all duration-300",
          isDark
            ? "opacity-100 rotate-0 scale-100 text-amber-400"
            : "opacity-0 rotate-90 scale-50 text-amber-400"
        )}
      />
      {/* Moon icon (shown in light mode to switch to dark) */}
      <Moon
        size={15}
        className={cn(
          "absolute transition-all duration-300",
          !isDark
            ? "opacity-100 rotate-0 scale-100 text-violet-500"
            : "opacity-0 -rotate-90 scale-50 text-violet-500"
        )}
      />
    </button>
  );
}
