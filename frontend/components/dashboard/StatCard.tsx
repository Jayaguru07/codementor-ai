import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  iconColor = "text-cyan-400",
  iconBg = "bg-cyan-500/10",
}: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 group cursor-default">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-primary)" }}>
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs mt-1.5 font-medium",
                trendUp ? "text-emerald-400" : ""
              )}
              style={trendUp ? {} : { color: "var(--text-muted)" }}
            >
              {trend}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl flex-shrink-0 transition-transform duration-200 group-hover:scale-110", iconBg)}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
    </div>
  );
}
