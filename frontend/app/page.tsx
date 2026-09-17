import Link from "next/link";
import { CheckCircle2, BookOpen, Flame, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { FocusAreas } from "@/components/dashboard/FocusAreas";
import { QuickActions } from "@/components/dashboard/QuickActions";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const stats = [
  {
    label: "Problems Solved",
    value: 24,
    icon: CheckCircle2,
    trend: "+3 this week",
    trendUp: true,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
  {
    label: "Concepts Learned",
    value: 12,
    icon: BookOpen,
    trend: "+2 this week",
    trendUp: true,
    iconColor: "text-sky-400",
    iconBg: "bg-sky-500/10",
  },
  {
    label: "Current Streak",
    value: "5 days",
    icon: Flame,
    trend: "Keep it up! 🔥",
    trendUp: true,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
  },
  {
    label: "Code Quality",
    value: "82%",
    icon: TrendingUp,
    trend: "+4% this month",
    trendUp: true,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {getGreeting()} 👋
          </h1>
          <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
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
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-500/30 rounded-xl shadow-lg shadow-cyan-900/30 transition-all duration-150 hover:scale-[1.02] hover:shadow-cyan-900/50"
          >
            ✨ Analyze Code
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Activity + Focus Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentActivity />
        <FocusAreas />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}
