import { AlertTriangle } from "lucide-react";

interface ErrorPatternsProps {
  patterns: string[];
}

export function ErrorPatterns({ patterns }: ErrorPatternsProps) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={15} className="text-amber-400" />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Error Patterns
        </h3>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
        Most common mistakes you make:
      </p>

      <div className="space-y-2">
        {patterns.map((pattern, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl transition-colors duration-150 border hover:bg-[var(--bg-surface-hover)]"
            style={{
              background: "var(--bg-elevated)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-400">
              {idx + 1}
            </span>
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              {pattern}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
