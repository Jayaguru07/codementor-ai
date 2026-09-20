"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Code2,
  History,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyzer", label: "Code Analyzer", icon: Code2 },
  { href: "/history", label: "History", icon: History },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

const bottomItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex flex-col w-60 min-h-screen glass-sidebar fixed left-0 top-0 z-30"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-600 shadow-lg shadow-violet-900/40">
          <Sparkles size={16} className="text-white" />
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            CodeMentor
          </span>
          <span className="text-sm font-bold text-violet-400"> AI</span>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-violet-600/15 border border-violet-500/25"
                  : "hover:bg-[var(--bg-surface-hover)]"
              )}
              style={
                active
                  ? { color: "var(--text-accent)" }
                  : { color: "var(--text-secondary)" }
              }
            >
              <Icon
                size={16}
                className={cn(
                  "flex-shrink-0 transition-colors",
                  active ? "text-violet-400" : "group-hover:text-violet-400"
                )}
                style={active ? {} : { color: "var(--text-muted)" }}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom nav + theme toggle */}
      <div
        className="px-3 py-4 space-y-0.5"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        {bottomItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group hover:bg-[var(--bg-surface-hover)]"
            style={{ color: "var(--text-muted)" }}
          >
            <Icon
              size={16}
              className="flex-shrink-0 transition-colors group-hover:text-violet-400"
              style={{ color: "var(--text-muted)" }}
            />
            {label}
          </Link>
        ))}

        {/* Theme toggle at bottom of sidebar */}
        <div
          className="flex items-center justify-between px-3 py-2.5"
        >
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Appearance
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
