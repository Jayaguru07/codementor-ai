"use client";

import { useEffect, useState } from "react";
import { getProgress } from "@/lib/api";
import { ProgressCard } from "@/components/progress/ProgressCard";
import { TopicProgress } from "@/components/progress/TopicProgress";
import { ErrorPatterns } from "@/components/progress/ErrorPatterns";
import { LearningStreak } from "@/components/progress/LearningStreak";
import { Skeleton } from "@/components/ui/Loading";
import type { ProgressData } from "@/types/analysis";

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProgress()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">
          Learning Progress
        </h1>
        <p className="text-zinc-500 mt-0.5 text-sm">
          Track your programming improvement.
        </p>
      </div>

      {loading || !data ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-2xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>

          <Skeleton className="h-40 rounded-2xl" />
        </div>
      ) : (
        <>
          {/* Overall score */}
          <ProgressCard
            score={data.overall_score}
            solvedCount={data.solved_count}
            totalCount={data.total_count}
          />

          {/* Mastery + Streak */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TopicProgress topics={data.topics} />

            <LearningStreak
              streakDays={data.streak_days}
              weeklyActivity={data.weekly_activity}
            />
          </div>

          {/* Error patterns */}
          <ErrorPatterns patterns={data.error_patterns} />
        </>
      )}
    </div>
  );
}