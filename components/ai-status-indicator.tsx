import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

interface AIStatusIndicatorProps {
  isProcessing: boolean;
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  aiModel: string;
}

export default function AIStatusIndicator({
  isProcessing,
  aiEnabled,
  setAiEnabled,
  aiModel,
}: AIStatusIndicatorProps) {
  const getModelName = (model: string) => {
    switch (model) {
      case "claude-3-haiku":
        return "Claude 3 Haiku";
      case "claude-3-sonnet":
        return "Claude 3 Sonnet";
      case "claude-3-opus":
        return "Claude 3 Opus";
      default:
        return "Claude AI";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center gap-1.5 text-xs ${
          aiEnabled ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <div
          className={`h-2 w-2 rounded-full ${
            isProcessing
              ? "bg-amber-500 animate-pulse"
              : aiEnabled
              ? "bg-emerald-500"
              : "bg-gray-400"
          }`}
        />
        {isProcessing ? (
          "Thinking..."
        ) : aiEnabled ? (
          <span>
            {getModelName(aiModel)} <span className="opacity-70">Ready</span>
          </span>
        ) : (
          "AI Disabled"
        )}
      </div>
      <Switch
        checked={aiEnabled}
        onCheckedChange={setAiEnabled}
        className="data-[state=checked]:bg-primary h-4 w-4"
      />
    </div>
  );
}
