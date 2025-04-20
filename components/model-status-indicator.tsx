"use client";

import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { RefreshCcw } from "lucide-react";
import { modelOptions } from "@/lib/model-options";

interface ModelStatusIndicatorProps {
  currentModel: string;
  failedModels: Set<string>;
  availableModels: string[];
  resetFailedModels: () => void;
}

export function ModelStatusIndicator({
  currentModel,
  failedModels,
  availableModels,
  resetFailedModels,
}: ModelStatusIndicatorProps) {
  const hasFailedModels = failedModels.size > 0;

  // Get a friendly name for display
  const getModelDisplayName = (modelValue: string): string => {
    const modelOption = modelOptions.find((m) => m.value === modelValue);
    if (modelOption) {
      // Return just the model provider part (claude, gpt, gemini)
      const provider = modelValue.split("-")[0];
      return provider;
    }
    // Fallback if model not found
    return modelValue.split("-")[0] || "Unknown";
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      <span className="text-xs text-muted-foreground">Models:</span>
      <TooltipProvider>
        <div className="flex flex-row gap-1">
          {availableModels.map((model) => {
            const isActive = model === currentModel;
            const hasFailed = failedModels.has(model);
            const displayName = getModelDisplayName(model);

            return (
              <Tooltip key={model}>
                <TooltipTrigger asChild>
                  <Badge
                    variant={
                      isActive
                        ? "default"
                        : hasFailed
                        ? "destructive"
                        : "outline"
                    }
                    className={`text-xs px-1.5 py-0.5 ${
                      isActive
                        ? "bg-primary"
                        : hasFailed
                        ? "bg-muted text-muted-foreground opacity-70"
                        : "bg-muted"
                    }`}
                  >
                    {displayName}
                    {isActive && "•"}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{model}</p>
                  <p className="text-xs">
                    {isActive
                      ? "Currently active"
                      : hasFailed
                      ? "Failed to generate valid suggestion"
                      : "Available model"}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>

      {hasFailedModels && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={resetFailedModels}
            >
              <RefreshCcw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset failed models</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
