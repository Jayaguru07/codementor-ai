"use client";

import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const activities = [
  {
    id: "1",
    language: "Python",
    langColor: "bg-sky-500",
    error: "IndexError",
    status: "solved" as const,
    time: "10 minutes ago",
  },
  {
    id: "2",
    language: "Java",
    langColor: "bg-orange-500",
    error: "NullPointerException",
    status: "solved" as const,
    time: "2 hours ago",
  },
  {
    id: "3",
    language: "C++",
    langColor: "bg-blue-500",
    error: "Segmentation Fault",
    status: "review" as const,
    time: "Yesterday",
  },
];

const statusConfig = {
  solved: { icon: CheckCircle2, label: "Solved", badgeVariant: "success" as const },
  review: { icon: AlertCircle, label: "Needs Review", badgeVariant: "warning" as const },
  failed: { icon: Circle, label: "Failed", badgeVariant: "error" as const },
};

export function RecentActivity() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Recent Activity
        </h3>
        <Link
          href="/history"
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      <div className="space-y-1">
        {activities.map((item) => {
          const { icon: StatusIcon, label, badgeVariant } = statusConfig[item.status];
          return (
            <Link
              key={item.id}
              href={`/history?id=${item.id}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group hover:bg-[var(--bg-surface-hover)]"
            >
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.langColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {item.language}
                  </span>
                  <span style={{ color: "var(--text-muted)" }} className="text-xs">·</span>
                  <span className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    {item.error}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={11} style={{ color: "var(--text-muted)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                    {item.time}
                  </span>
                </div>
              </div>
              <Badge variant={badgeVariant}>
                <StatusIcon size={10} />
                {label}
              </Badge>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
