"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface QuickCheckProps {
  concept?: string;
  selectedAnswer: number | null;
  onSelect: (idx: number) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const QUIZ_BY_CONCEPT: Record<string, QuizQuestion> = {
  indexing: {
    question: "What is the last valid index of a list containing 5 elements?",
    options: ["A. 3", "B. 4", "C. 5", "D. 6"],
    correct_index: 1,
    explanation:
      "Python uses zero-based indexing, so a list with 5 elements has indexes 0, 1, 2, 3, and 4.",
  },

  variables: {
    question: "What does a variable do in a Python program?",
    options: [
      "A. Stores a value",
      "B. Always stores text",
      "C. Deletes memory",
      "D. Stops the program",
    ],
    correct_index: 0,
    explanation:
      "A variable is a name that refers to a value in a program.",
  },

  loops: {
    question: "Which Python keyword is commonly used to repeat code over items in a sequence?",
    options: ["A. if", "B. for", "C. def", "D. import"],
    correct_index: 1,
    explanation:
      "The for keyword is commonly used to iterate over items in a sequence or other iterable.",
  },

  functions: {
    question: "Which keyword is used to define a function in Python?",
    options: ["A. function", "B. func", "C. def", "D. define"],
    correct_index: 2,
    explanation:
      "Python uses the def keyword to define a function.",
  },

  exceptions: {
    question: "What is the main purpose of a try/except block?",
    options: [
      "A. Repeat a loop",
      "B. Handle errors",
      "C. Define a variable",
      "D. Import a module",
    ],
    correct_index: 1,
    explanation:
      "A try/except block allows a program to handle exceptions instead of terminating unexpectedly.",
  },
};

const DEFAULT_QUIZ: QuizQuestion = {
  question: "What should you do first when debugging an error?",
  options: [
    "A. Ignore the error",
    "B. Read the error message",
    "C. Delete the code",
    "D. Restart the computer",
  ],
  correct_index: 1,
  explanation:
    "Reading the error message helps identify what went wrong and where to investigate.",
};

function getQuiz(concept?: string): QuizQuestion {
  if (!concept) return DEFAULT_QUIZ;

  const normalized = concept.toLowerCase();

  for (const [key, quiz] of Object.entries(QUIZ_BY_CONCEPT)) {
    if (normalized.includes(key)) {
      return quiz;
    }
  }

  return DEFAULT_QUIZ;
}

export function QuickCheck({
  concept,
  selectedAnswer,
  onSelect,
}: QuickCheckProps) {
  const quiz = getQuiz(concept);
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === quiz.correct_index;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-base">🧠 </span>
          Test Your Understanding
        </CardTitle>
      </CardHeader>

      <p
        className="text-sm font-medium mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        {quiz.question}
      </p>

      <div className="space-y-2 mb-4">
        {quiz.options.map((option, idx) => {
          const isSelected = selectedAnswer === idx;
          const isCorrectOption = idx === quiz.correct_index;

          let inlineStyle: React.CSSProperties = {
            background: "var(--bg-elevated)",
            borderColor: "var(--border-subtle)",
            color: "var(--text-secondary)",
          };

          if (answered) {
            if (isCorrectOption) {
              inlineStyle = {
                background: "rgba(16,185,129,0.08)",
                borderColor: "rgba(16,185,129,0.3)",
                color: "rgb(52,211,153)",
              };
            } else if (isSelected && !isCorrect) {
              inlineStyle = {
                background: "rgba(239,68,68,0.08)",
                borderColor: "rgba(239,68,68,0.3)",
                color: "rgb(248,113,113)",
              };
            } else {
              inlineStyle = {
                background: "transparent",
                borderColor: "var(--border-subtle)",
                color: "var(--text-muted)",
              };
            }
          }

          return (
            <button
              key={idx}
              onClick={() => !answered && onSelect(idx)}
              disabled={answered}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm text-left transition-all duration-150 disabled:cursor-default",
                !answered &&
                  "hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-medium)]"
              )}
              style={inlineStyle}
            >
              <span>{option}</span>

              {answered && isCorrectOption && (
                <CheckCircle2
                  size={15}
                  className="text-emerald-400 flex-shrink-0"
                />
              )}

              {answered && isSelected && !isCorrect && (
                <XCircle
                  size={15}
                  className="text-red-400 flex-shrink-0"
                />
              )}
            </button>
          );
        })}
      </div>

      {answered && (
        <div
          className="rounded-xl px-4 py-3 border text-sm"
          style={
            isCorrect
              ? {
                  background: "rgba(16,185,129,0.05)",
                  borderColor: "rgba(16,185,129,0.2)",
                }
              : {
                  background: "rgba(239,68,68,0.05)",
                  borderColor: "rgba(239,68,68,0.2)",
                }
          }
        >
          <p
            className={cn(
              "font-semibold mb-0.5",
              isCorrect ? "text-emerald-400" : "text-red-400"
            )}
          >
            {isCorrect ? "✓ Correct!" : "✗ Not quite."}
          </p>

          <p
            className="text-xs leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {quiz.explanation}
          </p>
        </div>
      )}
    </Card>
  );
}