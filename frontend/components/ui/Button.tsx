import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const variantStyles = {
  primary:
    "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/30 border border-violet-500/30 hover:shadow-violet-900/50",
  secondary:
    "border hover:border-[var(--border-medium)] hover:bg-[var(--bg-surface-hover)]",
  ghost: "hover:bg-[var(--bg-surface-hover)]",
  danger: "bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/25",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-6 py-2.5 text-base rounded-xl gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      className,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isSecondary = variant === "secondary";
    const isGhost = variant === "ghost";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:scale-[1.02] active:scale-[0.98]",
          variantStyles[variant],
          sizeClasses[size],
          className
        )}
        style={{
          ...(isSecondary
            ? {
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                borderColor: "var(--border-subtle)",
              }
            : isGhost
            ? { color: "var(--text-secondary)" }
            : {}),
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
