import { cn } from "@/lib/utils";
import { type HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "error" | "success";
  noPadding?: boolean;
}

const variantClasses = {
  default: "glass-card",
  highlight: "glass-card-accent",
  error: "glass-card-error",
  success: "glass-card-success",
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = "default", noPadding = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl",
          variantClasses[variant],
          noPadding ? "" : "p-5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => (
  <div className={cn("flex items-center justify-between mb-4", className)} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = ({ children, className, ...props }: CardTitleProps) => (
  <h3
    className={cn("text-sm font-semibold flex items-center gap-2", className)}
    style={{ color: "var(--text-primary)" }}
    {...props}
  >
    {children}
  </h3>
);

export { Card, CardHeader, CardTitle };
