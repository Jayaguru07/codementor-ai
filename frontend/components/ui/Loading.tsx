import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg", className)}
      style={{ background: "var(--border-subtle)" }}
    />
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block w-5 h-5 border-2 border-t-cyan-500 rounded-full animate-spin",
        className
      )}
      style={{ borderColor: "var(--border-medium)", borderTopColor: "#06b6d4" }}
    />
  );
}
