"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, BookOpen, Flame, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FocusAreas } from "@/components/dashboard/FocusAreas";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { getHistory, getProgress } from "@/lib/api";
import type { HistoryItem, ProgressData } from "@/types/analysis";

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getHistory(), getProgress()])
      .then(([historyData, progressData]) => {
        setItems(historyData);
        setProgress(progressData);
      })
      .finally(() => setLoading(false));
  }, []);

  const solvedCount = useMemo(
    () => items.filter((item) => item.status === "solved").length,
    [items]
  );

  const conceptsLearned = useMemo(() => {
    const concepts = new Set(
      items
        .map((item) => item.analysis?.concept)
        .filter(Boolean)
    );

    return concepts.size;
  }, [items]);

  const currentStreak = progress?.streak_days ?? 0;

  const successRate =
    items.length > 0
      ? Math.round((solvedCount / items.length) * 100)
      : 0;

  const stats = [
    {
      label: "Problems Solved",
      value: solvedCount,
      icon: CheckCircle2,
      trend: `${items.length} total analyses`,
      trendUp: true,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      label: "Concepts Learned",
      value: conceptsLearned,
      icon: BookOpen,
      trend: "From your analysis history",
      trendUp: true,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/10",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} ${currentStreak === 1 ? "day" : "days"
        }`,
      icon: Flame,
      trend: currentStreak > 0 ? "Keep practicing!" : "Start today!",
      trendUp: true,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      label: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      trend: "Based on analysis history",
      trendUp: true,
      iconColor: "text-cyan-400",
      iconBg: "bg-cyan-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            {getGreeting()} 👋
          </h1>

          <p
            className="mt-0.5 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Ready to improve your code?
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/progress"
            className="px-4 py-2 text-sm font-medium rounded-xl glass-card transition-all duration-150 hover:scale-[1.02]"
            style={{ color: "var(--text-primary)" }}
          >
            View Progress
          </Link>

          <Link
            href="/analyzer"
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-900/30 transition-all duration-150 hover:scale-[1.02]"
          >
            ✨ Analyze Code
          </Link>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="glass-card rounded-2xl p-5 h-32 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      {/* Activity + Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity items={items} />
        <FocusAreas topics={progress?.topics ?? []} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}