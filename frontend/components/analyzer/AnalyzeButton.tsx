import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AnalyzeButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function AnalyzeButton({ onClick, isLoading, disabled }: AnalyzeButtonProps) {
  return (
    <Button
      onClick={onClick}
      isLoading={isLoading}
      disabled={disabled}
      className="w-full sm:w-auto min-w-[140px]"
    >
      {!isLoading && <Sparkles size={16} />}
      {isLoading ? "Analyzing..." : "Analyze Code"}
    </Button>
  );
}
