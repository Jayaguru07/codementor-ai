import { TrendingUp } from "lucide-react";

interface ProgressCardProps {
  score: number;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Work";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-sky-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
}

export function ProgressCard({ score }: ProgressCardProps) {
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp size={16} className="text-cyan-400" />
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Overall Learning Score
        </h3>
      </div>

      <div className="flex items-center gap-8">
        {/* Circular progress */}
        <div className="relative flex-shrink-0">
          <svg width="128" height="128" className="rotate-[-90deg]">
            {/* Background ring */}
            <circle
              cx="64"
              cy="64"
              r="52"
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="10"
            />
            {/* Progress ring */}
            <circle
              cx="64"
              cy="64"
              r="52"
              fill="none"
              stroke="rgb(6, 182, 212)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold tabular-nums ${getScoreColor(score)}`}>
              {score}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            {getScoreLabel(score)}
          </p>
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
            You&apos;re making solid progress. Keep practicing to improve your weaker topics.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              Based on 24 solved problems
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
