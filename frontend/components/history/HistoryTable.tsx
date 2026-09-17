"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, Circle, Code2, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { HistoryItem } from "@/types/analysis";

interface HistoryTableProps {
  items: HistoryItem[];
}

const statusConfig = {
  solved: { icon: CheckCircle2, label: "Solved", badgeVariant: "success" as const },
  review: { icon: AlertCircle, label: "Needs Review", badgeVariant: "warning" as const },
  failed: { icon: Circle, label: "Failed", badgeVariant: "error" as const },
};

export function HistoryTable({ items }: HistoryTableProps) {
  const [selected, setSelected] = useState<HistoryItem | null>(null);

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead
              className="text-xs uppercase"
              style={{
                color: "var(--text-muted)",
                background: "var(--bg-surface)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <tr>
                <th className="px-6 py-4 font-medium">Language & Error</th>
                <th className="px-6 py-4 font-medium">Snippet</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {items.map((item) => {
                const { icon: StatusIcon, label, badgeVariant } = statusConfig[item.status];
                return (
                  <tr
                    key={item.id}
                    onClick={() => setSelected(item)}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-[var(--bg-surface-hover)]"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {item.language}
                      </div>
                      <div className="mt-0.5" style={{ color: "var(--text-secondary)" }}>
                        {item.error_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="font-mono text-xs truncate max-w-[200px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.code_snippet}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div style={{ color: "var(--text-secondary)" }}>
                        {item.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant={badgeVariant}>
                        <StatusIcon size={12} />
                        {label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center" style={{ color: "var(--text-muted)" }}>
                    No analysis history found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Analysis Detail
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 hover:bg-[var(--bg-surface-hover)]"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={statusConfig[selected.status].badgeVariant}>
                    {statusConfig[selected.status].label}
                  </Badge>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>
                    {selected.language}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {selected.date}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-red-400 mb-1">
                  {selected.error_type}
                </h4>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Code Snippet
                </p>
                <div
                  className="rounded-xl p-4 overflow-x-auto text-sm font-mono border"
                  style={{
                    background: "var(--bg-code)",
                    borderColor: "var(--border-subtle)",
                    color: "var(--text-primary)",
                  }}
                >
                  <pre><code>{selected.code_snippet}</code></pre>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                  Feedback
                </p>
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    background: "var(--bg-elevated)",
                    borderColor: "var(--border-subtle)",
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    This was a {selected.error_type} error. The AI analyzer provided feedback to help understand and fix the problem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
