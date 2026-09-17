"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Code2,
  History,
  BarChart3,
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

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Top bar - mobile only */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-header h-14 flex items-center justify-between px-4"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-violet-600">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            CodeMentor<span className="text-violet-400"> AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle in mobile header */}
          <ThemeToggle />

          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            style={{
              color: "var(--text-secondary)",
              background: open ? "var(--bg-elevated)" : "transparent",
            }}
            aria-label="Toggle navigation menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={cn(
          "lg:hidden fixed top-14 left-0 right-0 z-40 glass-header transition-all duration-200",
          open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <nav className="px-4 py-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                  active ? "bg-violet-600/15" : "hover:bg-[var(--bg-surface-hover)]"
                )}
                style={
                  active
                    ? { color: "var(--text-accent)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon
                  size={16}
                  className={active ? "text-violet-400" : ""}
                  style={active ? {} : { color: "var(--text-muted)" }}
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
