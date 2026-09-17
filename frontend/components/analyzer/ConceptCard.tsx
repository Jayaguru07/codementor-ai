import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";

interface ConceptCardProps {
  concept: string;
  relatedTopics?: string[];
}

export function ConceptCard({ concept, relatedTopics = [] }: ConceptCardProps) {
  return (
    <Card variant="highlight">
      <CardHeader>
        <CardTitle>
          <BookOpen size={15} className="text-cyan-400" />
          Concept
        </CardTitle>
      </CardHeader>
      <p className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
        {concept}
      </p>
      {relatedTopics.length > 0 && (
        <div>
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            Related topics
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((topic) => (
              <Badge key={topic} variant="cyan">
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
