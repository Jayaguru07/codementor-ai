"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { MOCK_QUIZ } from "@/lib/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface QuickCheckProps {
  selectedAnswer: number | null;
  onSelect: (idx: number) => void;
}

export function QuickCheck({ selectedAnswer, onSelect }: QuickCheckProps) {
  const quiz = MOCK_QUIZ;
  const answered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === quiz.correct_index;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="text-base">🧠</span>
          Test Your Understanding
        </CardTitle>
      </CardHeader>

      <p className="text-sm font-medium mb-4" style={{ color: "var(--text-primary)" }}>
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
                !answered && "hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-medium)]"
              )}
              style={inlineStyle}
            >
              <span>{option}</span>
              {answered && isCorrectOption && (
                <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0" />
              )}
              {answered && isSelected && !isCorrect && (
                <XCircle size={15} className="text-red-400 flex-shrink-0" />
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
          <p className={cn("font-semibold mb-0.5", isCorrect ? "text-emerald-400" : "text-red-400")}>
            {isCorrect ? "✓ Correct!" : "✗ Not quite."}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {quiz.explanation}
          </p>
        </div>
      )}
    </Card>
  );
}
