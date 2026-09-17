import { Lightbulb } from "lucide-react";

interface LearningTipProps {
  tip: string;
}

export function LearningTip({ tip }: LearningTipProps) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: "rgba(245,158,11,0.06)",
        border: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5"
          style={{ background: "rgba(245,158,11,0.12)" }}
        >
          <Lightbulb size={14} className="text-amber-400" />
        </div>
        <div>
          <p className="text-xs font-semibold text-amber-400 mb-1 uppercase tracking-wide">
            Learning Tip
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}
