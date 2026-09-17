import { CheckCircle2, ChevronRight, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { AnalyzeResponse } from "@/types/analysis";

interface SuccessStateProps {
  result: AnalyzeResponse;
}

export function SuccessState({ result }: SuccessStateProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result.corrected_code) return;
    try {
      await navigator.clipboard.writeText(result.corrected_code);
    } catch {
      const el = document.createElement("textarea");
      el.value = result.corrected_code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card-success rounded-2xl p-6 text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-400" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-emerald-400 mb-2">
          Looks good!
        </h3>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          No major errors detected. Your code seems syntactically correct.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Time Complexity</p>
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>O(1)</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Space Complexity</p>
          <p className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>O(1)</p>
        </div>
      </div>
      
      {result.explanation && (
        <div className="text-left mt-6 p-4 rounded-xl border" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
          <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Feedback:</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{result.explanation}</p>
        </div>
      )}

      {result.corrected_code && (
        <div className="text-left mt-6 rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-subtle)" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: "var(--bg-elevated)", borderColor: "var(--border-subtle)" }}>
             <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Refactored Version (Optional)</span>
             <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:bg-[var(--bg-surface-hover)]"
                style={{ color: copied ? "rgb(52,211,153)" : "var(--text-muted)" }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
          </div>
          <div className="p-4 overflow-x-auto text-sm font-mono" style={{ background: "var(--bg-code)", color: "var(--text-primary)" }}>
            <pre><code>{result.corrected_code}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
}
