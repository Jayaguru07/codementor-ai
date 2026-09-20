// ============================================================
// types/analysis.ts
// TypeScript interfaces for all API request/response types.
// These mirror the FastAPI backend contract exactly.
// Only change this file when the backend schema changes.
// ============================================================

export type Language = "python" | "java" | "cpp" | "javascript";

export interface AnalyzeRequest {
  language: Language;
  code: string;
}

export interface CodeQuality {
  correctness: number;
  readability: number;
  efficiency: number;
}

export interface AnalyzeResponse {
  success: boolean;
  error_type?: string;
  error_message?: string;
  severity?: "low" | "medium" | "high";
  line?: number;
  explanation?: string;
  concept?: string;
  related_topics?: string[];
  corrected_code?: string;
  learning_tip?: string;
  // Present only when success === true
  code_quality?: CodeQuality;
  suggested_improvement?: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  language: Language;
  error_type: string;
  status: "solved" | "review" | "failed";
  code_snippet: string;
  analysis: AnalyzeResponse;
}

export interface TopicProgress {
  topic: string;
  score: number;
}

export interface ProgressData {
  overall_score: number;
  solved_count: number;
  total_count: number;
  topics: TopicProgress[];
  error_patterns: string[];
  streak_days: number;
  weekly_activity: boolean[];
}
export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}
