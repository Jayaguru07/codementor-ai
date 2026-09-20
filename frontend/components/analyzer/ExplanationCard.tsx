import { HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface ExplanationCardProps {
  explanation: string;
}

export function ExplanationCard({ explanation }: ExplanationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <HelpCircle size={15} className="text-sky-400" />
          Why did this happen?
        </CardTitle>
      </CardHeader>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {explanation}
      </p>
    </Card>
  );
}
