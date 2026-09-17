import { BookOpen } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TopicProgress as TopicProgressType } from "@/types/analysis";

interface TopicProgressProps {
  topics: TopicProgressType[];
}

export function TopicProgress({ topics }: TopicProgressProps) {
  const sorted = [...topics].sort((a, b) => a.score - b.score);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen size={15} className="text-cyan-400" />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Concept Mastery
        </h3>
      </div>

      <div className="space-y-4">
        {sorted.map(({ topic, score }) => (
          <div key={topic}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {topic}
              </span>
              <span className="text-xs font-semibold tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {score}%
              </span>
            </div>
            <ProgressBar value={score} color="auto" />
          </div>
        ))}
      </div>

      <p className="text-xs mt-4" style={{ color: "var(--text-muted)" }}>
        Sorted from weakest to strongest.{" "}
        <span className="text-cyan-400">Focus on the top items.</span>
      </p>
    </div>
  );
}
