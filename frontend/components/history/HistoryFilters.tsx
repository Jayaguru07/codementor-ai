"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Search, ChevronDown } from "lucide-react";
import type { Language } from "@/types/analysis";

interface HistoryFiltersProps {
  filters: {
    search: string;
    language: string;
    status: string;
  };
  onChange: (filters: any) => void;
}

export function HistoryFilters({ filters, onChange }: HistoryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="text"
          placeholder="Search errors, code, or languages..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="w-full glass-input text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none"
        />
      </div>

      {/* Language filter */}
      <div className="relative w-full sm:w-[140px]">
        <select
          value={filters.language}
          onChange={(e) => onChange({ ...filters, language: e.target.value })}
          className="w-full appearance-none glass-input text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer"
        >
          <option value="all">All Languages</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="javascript">JavaScript</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
      </div>

      {/* Status filter */}
      <div className="relative w-full sm:w-[140px]">
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="w-full appearance-none glass-input text-sm rounded-xl pl-4 pr-10 py-2.5 outline-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="solved">Solved</option>
          <option value="review">Needs Review</option>
          <option value="failed">Failed</option>
        </select>
        <ChevronDown
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
      </div>
    </div>
  );
}
