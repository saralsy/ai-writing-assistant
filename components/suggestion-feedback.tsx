import { Button } from "@/components/ui/button";
import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";

interface SuggestionFeedbackProps {
  suggestion: string;
  setSuggestion: (suggestion: string) => void;
  acceptSuggestion: () => void;
}

export default function SuggestionFeedback({
  suggestion,
  setSuggestion,
  acceptSuggestion,
}: SuggestionFeedbackProps) {
  if (!suggestion) return null;

  return (
    <div className="border-t p-2 flex items-center justify-between bg-muted/30">
      <div className="flex items-center">
        <Sparkles className="h-4 w-4 text-primary mr-2" />
        <span className="text-sm">
          AI suggestion available (press Tab to accept)
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setSuggestion("")}>
          <ThumbsDown className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only md:inline-block">
            Not helpful
          </span>
        </Button>
        <Button variant="ghost" size="sm" onClick={acceptSuggestion}>
          <ThumbsUp className="h-4 w-4 mr-1" />
          <span className="sr-only md:not-sr-only md:inline-block">
            Helpful
          </span>
        </Button>
      </div>
    </div>
  );
}
