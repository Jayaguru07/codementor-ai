"use client";

import { useState, useCallback } from "react";
import { analyzeCode } from "@/lib/api";
import type { AnalyzeResponse, Language } from "@/types/analysis";

export type AnalyzerState =
  | "idle"
  | "analyzing"
  | "result"
  | "success"
  | "error";

export interface UseAnalyzerReturn {
  language: Language;
  setLanguage: (lang: Language) => void;
  code: string;
  setCode: (code: string) => void;
  state: AnalyzerState;
  result: AnalyzeResponse | null;
  errorMessage: string | null;
  selectedQuizAnswer: number | null;
  setSelectedQuizAnswer: (idx: number) => void;
  handleAnalyze: () => Promise<void>;
  handleReset: () => void;
}

const DEFAULT_CODE = `numbers = [10, 20, 30]

print(numbers[5])`;

export function useAnalyzer(): UseAnalyzerReturn {
  const [language, setLanguage] = useState<Language>("python");
  const [code, setCode] = useState(DEFAULT_CODE);
  const [state, setState] = useState<AnalyzerState>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!code.trim()) {
      setErrorMessage("Please enter some code before analyzing.");
      return;
    }

    setState("analyzing");
    setResult(null);
    setErrorMessage(null);
    setSelectedQuizAnswer(null);

    try {
      const response = await analyzeCode({ language, code });
      setResult(response);
      setState(response.success ? "success" : "result");
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to analyze your code. Please check your connection and try again.";
      setErrorMessage(msg);
      setState("error");
    }
  }, [language, code]);

  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
    setState("idle");
    setResult(null);
    setErrorMessage(null);
    setSelectedQuizAnswer(null);
  }, []);

  return {
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
  };
}
