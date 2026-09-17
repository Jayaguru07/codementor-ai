import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  color?: "violet" | "emerald" | "amber" | "sky" | "auto";
}

function getAutoColor(value: number): string {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-sky-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-red-500";
}

const colorClasses = {
  violet: "bg-violet-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  auto: "",
};

export function ProgressBar({
  value,
  className,
  barClassName,
  showLabel = false,
  color = "violet",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const barColor = color === "auto" ? getAutoColor(clamped) : colorClasses[color];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--border-subtle)" }}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-700", barColor, barClassName)}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs tabular-nums w-8 text-right"
          style={{ color: "var(--text-secondary)" }}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
