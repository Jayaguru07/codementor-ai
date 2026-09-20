"use client";

import Link from "next/link";
import { Code2, BookOpen, History, ArrowRight } from "lucide-react";

const actions = [
  {
    href: "/analyzer",
    icon: Code2,
    title: "Analyze Code",
    description: "Submit code for AI-powered review",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-400",
    accentBorder: "rgba(6,182,212,0.2)",
  },
  {
    href: "/progress",
    icon: BookOpen,
    title: "Practice Weak Topics",
    description: "Focus on areas needing improvement",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-400",
    accentBorder: "rgba(245,158,11,0.2)",
  },
  {
    href: "/history",
    icon: History,
    title: "View History",
    description: "Review past analyses and errors",
    iconBg: "bg-sky-500/10",
    iconColor: "text-sky-400",
    accentBorder: "rgba(14,165,233,0.2)",
  },
];

export function QuickActions() {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map(({ href, icon: Icon, title, description, iconBg, iconColor, accentBorder }) => (
          <Link
            key={href}
            href={href}
            className="group glass-card rounded-2xl p-4 flex flex-col gap-3"
            style={{ transition: "border-color 0.2s ease" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = accentBorder)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = "")
            }
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${iconBg}`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                {title}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {description}
              </p>
            </div>
            <ArrowRight
              size={14}
              className="group-hover:translate-x-1 transition-transform duration-150"
              style={{ color: "var(--text-muted)" }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
