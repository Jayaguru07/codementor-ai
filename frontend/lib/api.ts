// ============================================================
// lib/api.ts
// Centralized API service layer.
//
// Connects the frontend to the real FastAPI backend.
// ============================================================

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  HistoryItem,
  ProgressData,
} from "@/types/analysis";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ─── Quiz ────────────────────────────────────────────────────
// Temporary static quiz.
// This is not used for Dashboard, History, or Progress data.



// ─── Analyze ─────────────────────────────────────────────────

/**
 * Analyze code and return AI-generated feedback.
 */
export async function analyzeCode(
  req: AnalyzeRequest
): Promise<AnalyzeResponse> {
  if (!req.code.trim()) {
    throw new Error("Please enter some code before analyzing.");
  }

  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let message = `Server error: ${res.status}`;

    try {
      const errorData = await res.json();

      if (errorData.detail) {
        message = errorData.detail;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return res.json();
}

// ─── History ─────────────────────────────────────────────────

/**
 * Fetch analysis history from the real backend database.
 */
export async function getHistory(): Promise<HistoryItem[]> {
  const res = await fetch(`${API_URL}/api/history?limit=1000`);

  if (!res.ok) {
    throw new Error("Failed to fetch history");
  }

  const data = await res.json();

  return data.items.map((item: any) => ({
    id: String(item.id),
    date: new Date(item.timestamp).toLocaleString(),
    language: item.language,
    error_type: item.error_type || "No Error",
    status: item.success ? "solved" : "review",
    code_snippet: item.code,
    analysis: {
      success: item.success,
      error_type: item.error_type,
      error_message: item.error_message,
      line: item.line,
      explanation: item.explanation,
      concept: item.concept,
      corrected_code: item.corrected_code,
      learning_tip: item.learning_tip,
    },
  }));
}

// ─── Progress ────────────────────────────────────────────────

/**
 * Calculate learning progress from real analysis history.
 */
export async function getProgress(): Promise<ProgressData> {
  const res = await fetch(`${API_URL}/api/history?limit=1000`);

  if (!res.ok) {
    throw new Error("Failed to fetch progress data");
  }

  const data = await res.json();
  const items = data.items ?? [];

  if (items.length === 0) {
    return {
      overall_score: 0,
      solved_count: 0,
      total_count: 0,
      topics: [],
      error_patterns: [],
      streak_days: 0,
      weekly_activity: [false, false, false, false, false, false, false],
    };
  }

  // ─── Overall success rate ─────────────────────────────────

  const successful = items.filter(
    (item: any) => item.success
  ).length;

  const overallScore = Math.round(
    (successful / items.length) * 100
  );

  // ─── Concept mastery ──────────────────────────────────────

  const conceptStats = new Map<
    string,
    {
      total: number;
      successful: number;
    }
  >();

  items.forEach((item: any) => {
    const concept = item.concept?.trim();

    if (!concept) {
      return;
    }

    // Ignore language validation records.
    if (concept === "Supported Languages") {
      return;
    }

    const current = conceptStats.get(concept) ?? {
      total: 0,
      successful: 0,
    };

    current.total += 1;

    if (item.success) {
      current.successful += 1;
    }

    conceptStats.set(concept, current);
  });

  const topics = Array.from(conceptStats.entries())
    // Only show concepts with enough history
    // to make the percentage meaningful.
    .filter(([, stats]) => stats.total >= 2)
    .map(([topic, stats]) => ({
      topic,
      score: Math.round(
        (stats.successful / stats.total) * 100
      ),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 8);

  // ─── Error frequency ──────────────────────────────────────

  const errorCounts = new Map<string, number>();

  items.forEach((item: any) => {
    const error = item.error_type?.trim();

    if (!error || error === "No Error") {
      return;
    }

    errorCounts.set(
      error,
      (errorCounts.get(error) ?? 0) + 1
    );
  });

  const errorPatterns = Array.from(errorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(
      ([error, count]) =>
        `${error} (${count} occurrences)`
    );

  // ─── Weekly activity ──────────────────────────────────────

  const activityDates = new Set(
    items.map((item: any) => {
      return new Date(item.timestamp).toLocaleDateString();
    })
  );

  // Sunday -> Saturday
  const today = new Date();

  const startOfWeek = new Date(today);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(
    today.getDate() - today.getDay()
  );

  const weeklyActivity = Array.from(
    { length: 7 },
    (_, index) => {
      const day = new Date(startOfWeek);

      day.setDate(
        startOfWeek.getDate() + index
      );

      return activityDates.has(
        day.toLocaleDateString()
      );
    }
  );

  // ─── Current learning streak ──────────────────────────────

  const activityDayKeys = new Set(
    items.map((item: any) => {
      const date = new Date(item.timestamp);

      date.setHours(0, 0, 0, 0);

      return date.toDateString();
    })
  );

  let streakDays = 0;

  const streakDate = new Date();
  streakDate.setHours(0, 0, 0, 0);

  while (
    activityDayKeys.has(
      streakDate.toDateString()
    )
  ) {
    streakDays += 1;

    streakDate.setDate(
      streakDate.getDate() - 1
    );
  }

  // ─── Final progress result ────────────────────────────────

  return {
    overall_score: overallScore,
    solved_count: successful,
    total_count: items.length,
    topics,
    error_patterns: errorPatterns,
    streak_days: streakDays,
    weekly_activity: weeklyActivity,
  };
}

// Export API base URL for debugging/reference.
export { API_URL };