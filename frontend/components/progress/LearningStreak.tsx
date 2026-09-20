import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface LearningStreakProps {
  streakDays: number;
  weeklyActivity: boolean[]; // 7 booleans, Sun→Sat
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function LearningStreak({ streakDays, weeklyActivity }: LearningStreakProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-amber-400" />
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Learning Streak
          </h3>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
          <Flame size={13} className="text-amber-400" />
          <span className="text-sm font-bold text-amber-500">{streakDays} days</span>
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Keep practicing!
      </p>

      {/* Weekly activity */}
      <div>
        <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>
          This week
        </p>
        <div className="flex items-end gap-1.5">
          {weeklyActivity.map((active, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={cn(
                  "w-full h-8 rounded-lg transition-all duration-300",
                  active
                    ? "bg-cyan-500/80 border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    : "border hover:bg-[var(--bg-surface-hover)]"
                )}
                style={
                  active
                    ? {}
                    : { background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }
                }
              />
              <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                {DAY_LABELS[idx]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="flex items-center gap-3 mt-4 pt-4"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-cyan-500/80" />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Active
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded" style={{ background: "var(--bg-elevated)" }} />
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Inactive
          </span>
        </div>
      </div>
    </div>
  );
}
