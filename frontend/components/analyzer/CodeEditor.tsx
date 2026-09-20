"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Loading";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col gap-2 p-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/4" />
    </div>
  ),
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  readOnly?: boolean;
  height?: string;
  monacoTheme?: string;
}

const monacoLanguageMap: Record<string, string> = {
  python: "python",
  java: "java",
  cpp: "cpp",
  javascript: "javascript",
};

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = "300px",
  monacoTheme = "vs-dark",
}: CodeEditorProps) {
  return (
    <div
      className="overflow-hidden"
      style={{
        height,
        transition: "height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <MonacoEditor
        height={height}
        language={monacoLanguageMap[language] ?? "python"}
        value={value}
        theme={monacoTheme}
        onChange={(val) => onChange(val ?? "")}
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontLigatures: true,
          lineNumbers: "on",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 4,
          readOnly,
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          bracketPairColorization: { enabled: true },
          renderLineHighlight: "line",
          smoothScrolling: true,
          cursorBlinking: "smooth",
          roundedSelection: true,
        }}
      />
    </div>
  );
}
