// ============================================================
// lib/api.ts
// Centralized API service layer.
//
// Currently uses MOCK DATA with simulated network delay.
//
// TO CONNECT THE REAL BACKEND:
//   1. Set NEXT_PUBLIC_API_URL in .env.local (already done)
//   2. Replace each mock function body below with a real fetch() call.
//   3. Do NOT modify any UI components — only this file.
//
// Backend endpoint contract:
//   POST /api/analyze  →  AnalyzeResponse
//   GET  /api/history  →  HistoryItem[]
//   GET  /api/progress →  ProgressData
// ============================================================

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  HistoryItem,
  ProgressData,
  QuizQuestion,
} from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Simulated network delay (ms) — remove when using real backend */
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── Mock data ───────────────────────────────────────────────

const MOCK_ERROR_RESPONSE: AnalyzeResponse = {
  success: false,
  error_type: "IndexError",
  error_message: "list index out of range",
  severity: "medium",
  line: 3,
  explanation:
    "The code attempts to access index 5 of the list 'numbers', but the list only contains 3 elements at indexes 0, 1, and 2. Python raises an IndexError whenever you try to access an index that does not exist in the list.",
  concept: "List Indexing",
  related_topics: ["Arrays", "Loops", "Zero-based indexing"],
  corrected_code: `numbers = [10, 20, 30]\n\n# Use a valid index (0 to len(numbers)-1)\nprint(numbers[2])  # Output: 30`,
  learning_tip:
    "Python uses zero-based indexing. For a list with n elements, valid indexes range from 0 to n−1. Always check len(list) before accessing by index.",
};

const MOCK_SUCCESS_RESPONSE: AnalyzeResponse = {
  success: true,
  explanation: "Your code executed successfully without any errors.",
  concept: "Basic Output",
  related_topics: ["print()", "Variables", "Data Types"],
  corrected_code: "",
  learning_tip:
    "Great code! Keep writing clean, readable programs with meaningful variable names.",
  code_quality: {
    correctness: 95,
    readability: 82,
    efficiency: 78,
  },
  suggested_improvement:
    "Consider adding a comment explaining what the code does, and use f-strings for cleaner string formatting.",
};

const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    date: "Today, 10:30 AM",
    language: "python",
    error_type: "IndexError",
    status: "solved",
    code_snippet: 'numbers = [10, 20, 30]\nprint(numbers[5])',
    analysis: MOCK_ERROR_RESPONSE,
  },
  {
    id: "2",
    date: "Today, 08:15 AM",
    language: "java",
    error_type: "NullPointerException",
    status: "solved",
    code_snippet: 'String s = null;\nSystem.out.println(s.length());',
    analysis: {
      ...MOCK_ERROR_RESPONSE,
      error_type: "NullPointerException",
      error_message: "Cannot invoke method on null object",
      concept: "Null Safety",
      related_topics: ["References", "Null Checks", "Optional"],
    },
  },
  {
    id: "3",
    date: "Yesterday, 04:45 PM",
    language: "cpp",
    error_type: "Segmentation Fault",
    status: "review",
    code_snippet: 'int arr[3] = {1, 2, 3};\ncout << arr[10];',
    analysis: {
      ...MOCK_ERROR_RESPONSE,
      error_type: "Segmentation Fault",
      error_message: "Memory access violation",
      concept: "Memory Management",
      related_topics: ["Pointers", "Arrays", "Stack Memory"],
    },
  },
  {
    id: "4",
    date: "Yesterday, 02:00 PM",
    language: "javascript",
    error_type: "TypeError",
    status: "solved",
    code_snippet: 'const x = undefined;\nconsole.log(x.name);',
    analysis: {
      ...MOCK_ERROR_RESPONSE,
      error_type: "TypeError",
      error_message: "Cannot read properties of undefined",
      concept: "Type Coercion",
      related_topics: ["undefined", "null", "Type Checking"],
    },
  },
  {
    id: "5",
    date: "2 days ago",
    language: "python",
    error_type: "RecursionError",
    status: "review",
    code_snippet: 'def factorial(n):\n    return n * factorial(n)',
    analysis: {
      ...MOCK_ERROR_RESPONSE,
      error_type: "RecursionError",
      error_message: "maximum recursion depth exceeded",
      concept: "Recursion",
      related_topics: ["Base Case", "Stack Overflow", "Divide & Conquer"],
    },
  },
];

const MOCK_PROGRESS: ProgressData = {
  overall_score: 78,
  topics: [
    { topic: "Arrays", score: 82 },
    { topic: "Loops", score: 91 },
    { topic: "Recursion", score: 43 },
    { topic: "Linked Lists", score: 61 },
    { topic: "Trees", score: 38 },
    { topic: "Sorting", score: 74 },
  ],
  error_patterns: [
    "Off-by-one errors",
    "Null / undefined handling",
    "Recursion base cases",
    "Incorrect loop conditions",
  ],
  streak_days: 5,
  weekly_activity: [true, true, false, true, true, true, false],
};

export const MOCK_QUIZ: QuizQuestion = {
  question: "What is the last valid index of a list containing 5 elements?",
  options: ["A.  3", "B.  4", "C.  5", "D.  6"],
  correct_index: 1,
  explanation:
    "Since Python uses zero-based indexing, a list with 5 elements has indexes 0, 1, 2, 3, and 4. The last valid index is 4.",
};

// ─── API Functions ───────────────────────────────────────────

/**
 * Analyze code and return AI-generated feedback.
 *
 * MOCK MODE: Returns mock data after a simulated delay.
 * REAL MODE: Replace body with:
 *   const res = await fetch(`${API_URL}/api/analyze`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(req),
 *   });
 *   if (!res.ok) throw new Error(`Server error: ${res.status}`);
 *   return res.json();
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
      // Keep the default error message
    }

    throw new Error(message);
  }

  return res.json();
}
/**
 * Fetch analysis history.
 *
 * REAL MODE: Replace body with:
 *   const res = await fetch(`${API_URL}/api/history`);
 *   if (!res.ok) throw new Error("Failed to fetch history");
 *   return res.json();
 */
export async function getHistory(): Promise<HistoryItem[]> {
  await delay(500);
  return MOCK_HISTORY;
}

/**
 * Fetch learning progress data.
 *
 * REAL MODE: Replace body with:
 *   const res = await fetch(`${API_URL}/api/progress`);
 *   if (!res.ok) throw new Error("Failed to fetch progress");
 *   return res.json();
 */
export async function getProgress(): Promise<ProgressData> {
  await delay(500);
  return MOCK_PROGRESS;
}

// Export the base URL for reference (e.g., in debug panels)
export { API_URL };

