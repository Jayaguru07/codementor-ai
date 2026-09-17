"use client";

import { useEffect, useState } from "react";
import { Check, Circle } from "lucide-react";
import { Skeleton } from "@/components/ui/Loading";

const steps = [
  { id: 1, label: "Checking code syntax" },
  { id: 2, label: "Detecting errors" },
  { id: 3, label: "Generating explanation" },
  { id: 4, label: "Preparing learning tips" },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers = steps.map((_, i) =>
      setTimeout(() => setCurrentStep(i + 1), i * 500)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="py-8 px-4 space-y-6">
      <div className="text-center">
        <div
          className="inline-flex items-center gap-2 text-sm font-medium mb-1"
          style={{ color: "var(--text-secondary)" }}
        >
          <span className="inline-block w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          Analyzing your code...
        </div>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          This usually takes a few seconds
        </p>
      </div>

      <div className="space-y-2 max-w-xs mx-auto">
        {steps.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {done ? (
                  <Check size={14} className="text-emerald-400" />
                ) : active ? (
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                ) : (
                  <Circle size={12} style={{ color: "var(--text-muted)" }} />
                )}
              </div>
              <span
                className="text-xs"
                style={{
                  color: done
                    ? "rgb(52,211,153)"
                    : active
                    ? "var(--text-primary)"
                    : "var(--text-muted)",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 mt-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    </div>
  );
}
