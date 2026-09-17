import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface ErrorCardProps {
  errorType: string;
  errorMessage: string;
  severity: "low" | "medium" | "high";
  line?: number;
}

const severityConfig = {
  low: { label: "Low", variant: "info" as const },
  medium: { label: "Medium", variant: "warning" as const },
  high: { label: "High", variant: "error" as const },
};

export function ErrorCard({ errorType, errorMessage, severity, line }: ErrorCardProps) {
  const { label, variant } = severityConfig[severity];

  return (
    <Card variant="error">
      <CardHeader>
        <CardTitle>
          <AlertCircle size={15} className="text-red-400" />
          <span className="text-red-400">Error Detected</span>
        </CardTitle>
        <Badge variant={variant}>Severity: {label}</Badge>
      </CardHeader>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {errorType}
          </span>
          {line && <Badge variant="default">Line {line}</Badge>}
        </div>

        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <p className="font-mono text-sm text-red-400 break-all">
            &ldquo;{errorMessage}&rdquo;
          </p>
        </div>
      </div>
    </Card>
  );
}
