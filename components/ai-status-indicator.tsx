import { Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AIStatusIndicatorProps {
  isProcessing: boolean
  confidenceLevel?: number
}

export default function AIStatusIndicator({ isProcessing, confidenceLevel = 0.8 }: AIStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-1.5">
      {isProcessing ? (
        <Loader2 className="h-4 w-4 text-primary animate-spin" />
      ) : (
        <Sparkles className={cn("h-4 w-4", confidenceLevel > 0.7 ? "text-primary" : "text-muted-foreground")} />
      )}

      <div className="flex h-1.5 w-12 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isProcessing ? "w-1/3 animate-pulse bg-primary/70" : "bg-primary",
          )}
          style={{
            width: isProcessing ? undefined : `${confidenceLevel * 100}%`,
          }}
        />
      </div>
    </div>
  )
}

