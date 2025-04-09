import { Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { modelOptions } from "@/lib/model-options";

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
  // Get model display name from the modelOptions array
  const getModelName = (modelValue: string) => {
    const model = modelOptions.find((option) => option.value === modelValue);
    if (model) {
      // Extract just the main part of the model name for the status indicator
      // This makes it more compact for the UI
      const nameParts = model.label.split(" ");
      // For models like "Claude 3 Sonnet", return "Claude 3 Sonnet"
      // For models like "GPT-4o", return "GPT-4o"
      return model.label.includes("Claude") || model.label.includes("Gemini")
        ? `${nameParts[0]} ${nameParts[1]}${
            nameParts[2] ? " " + nameParts[2] : ""
          }`
        : model.label;
    }
    return "Claude AI";
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
