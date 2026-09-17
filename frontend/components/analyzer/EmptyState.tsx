import { Code2, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="relative mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center glass-card"
        >
          <Code2 size={28} style={{ color: "var(--text-muted)" }} />
        </div>
        <div
          className="absolute -top-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center"
          style={{
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.25)",
          }}
        >
          <Sparkles size={11} className="text-violet-400" />
        </div>
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
        Your analysis will appear here
      </h3>
      <p className="text-sm max-w-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
        Submit your code to get an explanation, correction, and learning recommendations.
      </p>
    </div>
  );
}
