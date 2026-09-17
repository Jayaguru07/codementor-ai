"use client";

import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
import { CodeEditor } from "@/components/analyzer/CodeEditor";
import { useTheme } from "@/contexts/ThemeContext";

interface CorrectedCodeProps {
  code: string;
  language: string;
}

export function CorrectedCode({ code, language }: CorrectedCodeProps) {
  const [copied, setCopied] = useState(false);
  const { monacoTheme } = useTheme();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-emerald-400" />
          <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Corrected Code
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border hover:scale-[1.03] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          style={
            copied
              ? {
                  background: "rgba(16,185,129,0.1)",
                  borderColor: "rgba(16,185,129,0.2)",
                  color: "rgb(52,211,153)",
                }
              : {
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                  color: "var(--text-secondary)",
                }
          }
          aria-label="Copy corrected code to clipboard"
        >
          {copied ? (
            <>
              <Check size={12} />
              Copied!
            </>
          ) : (
            <>
              <Copy size={12} />
              Copy Code
            </>
          )}
        </button>
      </div>
      <CodeEditor
        value={code}
        onChange={() => {}}
        language={language}
        readOnly
        height="180px"
        monacoTheme={monacoTheme}
      />
    </div>
  );
}
