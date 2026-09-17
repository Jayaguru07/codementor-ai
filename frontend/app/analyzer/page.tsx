"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, Maximize2, Minimize2 } from "lucide-react";
import { useAnalyzer } from "@/hooks/useAnalyzer";
import { useTheme } from "@/contexts/ThemeContext";
import { CodeEditor } from "@/components/analyzer/CodeEditor";
import { LanguageSelector } from "@/components/analyzer/LanguageSelector";
import { AnalyzeButton } from "@/components/analyzer/AnalyzeButton";
import { EmptyState } from "@/components/analyzer/EmptyState";
import { LoadingState } from "@/components/analyzer/LoadingState";
import { ErrorCard } from "@/components/analyzer/ErrorCard";
import { ExplanationCard } from "@/components/analyzer/ExplanationCard";
import { CorrectedCode } from "@/components/analyzer/CorrectedCode";
import { ConceptCard } from "@/components/analyzer/ConceptCard";
import { LearningTip } from "@/components/analyzer/LearningTip";
import { QuickCheck } from "@/components/analyzer/QuickCheck";
import { SuccessState } from "@/components/analyzer/SuccessState";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const NORMAL_HEIGHT = "420px";
const EXPANDED_HEIGHT = "calc(100vh - 200px)";

const fileNames: Record<string, string> = {
  python: "main.py",
  java: "Main.java",
  cpp: "main.cpp",
  javascript: "main.js",
};

export default function AnalyzerPage() {
  const {
    language,
    setLanguage,
    code,
    setCode,
    state,
    result,
    errorMessage,
    selectedQuizAnswer,
    setSelectedQuizAnswer,
    handleAnalyze,
    handleReset,
  } = useAnalyzer();

  const { monacoTheme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const lineCount = code.split("\n").length;
  const charCount = code.length;
  const editorHeight = expanded ? EXPANDED_HEIGHT : NORMAL_HEIGHT;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
          Code Analyzer
        </h1>
        <p className="mt-0.5 text-sm" style={{ color: "var(--text-secondary)" }}>
          Analyze your code and learn from your mistakes.
        </p>
      </div>

      <div
        className={cn(
          "grid gap-6 items-start",
          expanded ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"
        )}
      >
        {/* ─── Left Panel: Editor ─── */}
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-end gap-3 flex-wrap">
            <div className="flex-1 min-w-[160px] max-w-[200px]">
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="flex-shrink-0"
              aria-label="Reset editor to default code"
            >
              <RefreshCw size={13} />
              Reset
            </Button>
          </div>

          {/* Editor card */}
          <div
            className="glass-panel rounded-2xl overflow-hidden"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            {/* Titlebar */}
            <div
              className="flex items-center justify-between px-4 py-2.5"
              style={{
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-code)",
              }}
            >
              {/* macOS-style dots */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              </div>

              {/* Filename */}
              <span
                className="text-xs font-mono"
                style={{ color: "var(--text-muted)" }}
              >
                {fileNames[language] ?? "main.py"}
              </span>

              {/* Right controls */}
              <div className="flex items-center gap-3">
                <span
                  className="text-xs tabular-nums hidden sm:block"
                  style={{ color: "var(--text-muted)" }}
                >
                  {lineCount} ln · {charCount} ch
                </span>

                {/* Expand / Collapse button */}
                <button
                  onClick={() => setExpanded((e) => !e)}
                  aria-label={expanded ? "Collapse code editor" : "Expand code editor"}
                  title={expanded ? "Collapse code editor" : "Expand code editor"}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-150 hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {expanded ? (
                    <>
                      <Minimize2 size={13} />
                      <span className="hidden sm:inline">Collapse</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={13} />
                      <span className="hidden sm:inline">Expand</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Monaco Editor — height controlled by expanded state */}
            <CodeEditor
              value={code}
              onChange={setCode}
              language={language}
              height={editorHeight}
              monacoTheme={monacoTheme}
            />
          </div>

          {/* Network error state */}
          {state === "error" && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{
                background: "rgba(239,68,68,0.05)",
                borderColor: "rgba(239,68,68,0.2)",
              }}
            >
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Analysis Failed</p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {errorMessage}
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleAnalyze}>
                Retry
              </Button>
            </div>
          )}

          {/* Analyze button row */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {state === "result" || state === "success"
                ? "✓ Analysis complete"
                : "Submit your code for AI analysis"}
            </p>
            <AnalyzeButton
              onClick={handleAnalyze}
              isLoading={state === "analyzing"}
            />
          </div>
        </div>

        {/* ─── Right / Bottom Panel: Results ─── */}
        <div
          className="glass-panel rounded-2xl min-h-[480px]"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--text-secondary)" }}
            >
              Analysis Result
            </h2>
          </div>

          <div className="p-4 space-y-4">
            {state === "idle" && <EmptyState />}
            {state === "analyzing" && <LoadingState />}

            {state === "result" && result && (
              <>
                <ErrorCard
                  errorType={result.error_type!}
                  errorMessage={result.error_message!}
                  severity={result.severity ?? "medium"}
                  line={result.line}
                />
                <ExplanationCard explanation={result.explanation!} />
                <ConceptCard
                  concept={result.concept!}
                  relatedTopics={result.related_topics}
                />
                <CorrectedCode code={result.corrected_code!} language={language} />
                <LearningTip tip={result.learning_tip!} />
                <QuickCheck
                  selectedAnswer={selectedQuizAnswer}
                  onSelect={setSelectedQuizAnswer}
                />
              </>
            )}

            {state === "success" && result && (
              <>
                <SuccessState result={result} />
                {result.learning_tip && <LearningTip tip={result.learning_tip} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
