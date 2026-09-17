import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "cyan";
}

const variantClasses = {
  default: "bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]",
  success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border border-red-500/20",
  info: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
  cyan: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
};

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
