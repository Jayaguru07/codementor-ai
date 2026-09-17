"use client";

import { useEffect, useState, useMemo } from "react";
import { getHistory } from "@/lib/api";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistoryTable } from "@/components/history/HistoryTable";
import { Skeleton } from "@/components/ui/Loading";
import type { HistoryItem, Language } from "@/types/analysis";

interface Filters {
  search: string;
  language: Language | "all";
  status: "all" | "solved" | "review" | "failed";
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    language: "all",
    status: "all",
  });

  useEffect(() => {
    getHistory()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !filters.search ||
        item.error_type.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.language.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.code_snippet.toLowerCase().includes(filters.search.toLowerCase());

      const matchLang =
        filters.language === "all" || item.language === filters.language;

      const matchStatus =
        filters.status === "all" || item.status === filters.status;

      return matchSearch && matchLang && matchStatus;
    });
  }, [items, filters]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Analysis History</h1>
        <p className="text-zinc-500 mt-0.5 text-sm">
          Review your previous coding attempts.
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-zinc-500">
          <span className="text-zinc-200 font-semibold">{items.length}</span> total sessions
        </span>
        <span className="text-zinc-700">·</span>
        <span className="text-zinc-500">
          <span className="text-emerald-400 font-semibold">
            {items.filter((i) => i.status === "solved").length}
          </span>{" "}
          solved
        </span>
        <span className="text-zinc-700">·</span>
        <span className="text-zinc-500">
          <span className="text-amber-400 font-semibold">
            {items.filter((i) => i.status === "review").length}
          </span>{" "}
          in review
        </span>
      </div>

      {/* Filters */}
      <HistoryFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {filtered.length !== items.length && (
            <p className="text-xs text-zinc-600">
              Showing {filtered.length} of {items.length} entries
            </p>
          )}
          <HistoryTable items={filtered} />
        </>
      )}
    </div>
  );
}
