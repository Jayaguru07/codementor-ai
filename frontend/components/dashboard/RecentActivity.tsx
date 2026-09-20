"use client";

import Link from "next/link";
import { Clock, CheckCircle2, AlertCircle, Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { HistoryItem } from "@/types/analysis";

interface RecentActivityProps {
  items: HistoryItem[];
}

const statusConfig = {
  solved: {
    icon: CheckCircle2,
    label: "Solved",
    badgeVariant: "success" as const,
  },
  review: {
    icon: AlertCircle,
    label: "Needs Review",
    badgeVariant: "warning" as const,
  },
  failed: {
    icon: Circle,
    label: "Failed",
    badgeVariant: "error" as const,
  },
};

const languageColors: Record<string, string> = {
  python: "bg-sky-500",
  java: "bg-orange-500",
  cpp: "bg-blue-500",
  javascript: "bg-yellow-500",
};

export function RecentActivity({ items }: RecentActivityProps) {
  const activities = items.slice(0, 3);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
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
          const {
            icon: StatusIcon,
            label,
            badgeVariant,
          } = statusConfig[item.status];

          return (
            <Link
              key={item.id}
              href={`/history?id=${item.id}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-150 group hover:bg-[var(--bg-surface-hover)]"
            >
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  languageColors[item.language] ?? "bg-cyan-500"
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {item.language}
                  </span>

                  <span
                    style={{ color: "var(--text-muted)" }}
                    className="text-xs"
                  >
                    ·
                  </span>

                  <span
                    className="text-xs truncate"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {item.error_type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock
                    size={11}
                    style={{ color: "var(--text-muted)" }}
                  />

                  <span
                    className="text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.date}
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

        {activities.length === 0 && (
          <p
            className="text-xs py-6 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            No analysis activity yet.
          </p>
        )}
      </div>
    </div>
  );
}