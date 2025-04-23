"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface InlineAIIndicatorProps {
  position: { top: number; left: number };
  action: string; // "expanding", "rewriting", or "improving"
}

export function InlineAIIndicator({
  position,
  action,
}: InlineAIIndicatorProps) {
  // Determine appropriate message
  let message = "";
  switch (action) {
    case "expanding":
      message = "Expanding text...";
      break;
    case "rewriting":
      message = "Rewriting text...";
      break;
    case "improving":
      message = "Improving text...";
      break;
    default:
      message = "Processing...";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-50 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium shadow-md"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <Sparkles className="h-3 w-3 animate-pulse" />
      <span>{message}</span>
      <motion.div
        className="ml-1 flex space-x-1"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="h-1 w-1 rounded-full bg-primary-foreground" />
        <span className="h-1 w-1 rounded-full bg-primary-foreground" />
        <span className="h-1 w-1 rounded-full bg-primary-foreground" />
      </motion.div>
    </motion.div>
  );
}
