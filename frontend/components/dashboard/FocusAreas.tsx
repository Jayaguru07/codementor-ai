import { ProgressBar } from "@/components/ui/ProgressBar";
import type { TopicProgress as TopicProgressType } from "@/types/analysis";

interface FocusAreasProps {
  topics: TopicProgressType[];
}

export function FocusAreas({ topics }: FocusAreasProps) {
  const focusAreas = [...topics]
    .sort((a, b) => a.score - b.score)
    .slice(0, 4);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4">
        <h3
          className="text-sm font-semibold mb-0.5"
          style={{ color: "var(--text-primary)" }}
        >
          Focus Areas
        </h3>

        <p
          className="text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          Practice these topics to improve your score.
        </p>
      </div>

      <div className="space-y-4">
        {focusAreas.map(({ topic, score }) => (
          <div key={topic}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "var(--text-secondary)" }}
              >
                {topic}
              </span>

              <span
                className="text-xs font-semibold tabular-nums"
                style={{ color: "var(--text-secondary)" }}
              >
                {score}%
              </span>
            </div>

            <ProgressBar value={score} color="auto" />
          </div>
        ))}

        {focusAreas.length === 0 && (
          <p
            className="text-xs py-6 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Not enough analysis history yet.
          </p>
        )}
      </div>
    </div>
  );
}