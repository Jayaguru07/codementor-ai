"use client";

import { ChevronDown } from "lucide-react";
import type { Language } from "@/types/analysis";
import { cn } from "@/lib/utils";

const languages: { id: Language; label: string }[] = [
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "cpp", label: "C++" },
  { id: "javascript", label: "JavaScript" },
];

interface LanguageSelectorProps {
  value: Language;
  onChange: (value: Language) => void;
  className?: string;
}

export function LanguageSelector({ value, onChange, className }: LanguageSelectorProps) {
  return (
    <div className={cn("relative", className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Language)}
        className="w-full appearance-none glass-input text-sm rounded-xl pl-4 pr-10 py-2 font-medium cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
      </div>
    </div>
  );
}
