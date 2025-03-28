import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TextEditorProps {
  content: string;
  suggestion: string;
  isProcessing: boolean;
  font: string;
  fontSize: number;
  lineSpacing: number;
  backgroundColor: string;
  showBackgroundLines: boolean;
  lineSpacing_background: number;
  lineColor: string;
  handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function TextEditor({
  content,
  suggestion,
  isProcessing,
  font,
  fontSize,
  lineSpacing,
  backgroundColor,
  showBackgroundLines,
  lineSpacing_background,
  lineColor,
  handleContentChange,
}: TextEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Function to generate CSS for background lines
  const getBackgroundLinesCSS = () => {
    if (!showBackgroundLines) return {};

    return {
      backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
      backgroundSize: `100% ${lineSpacing_background}px`,
      backgroundPosition: "0 0",
    };
  };

  const getFontFamily = () => {
    switch (font) {
      case "georgia":
        return "Georgia, serif";
      case "courier":
        return "Courier, monospace";
      case "helvetica":
        return "Helvetica, sans-serif";
      default:
        return "Inter, sans-serif";
    }
  };

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{ backgroundColor }}
    >
      <div
        className="relative min-h-full w-full max-w-full"
        style={getBackgroundLinesCSS()}
      >
        <div className="absolute top-0 left-0 right-0 bottom-0 p-8">
          <div className="relative w-full h-full">
            <textarea
              ref={editorRef}
              value={content}
              onChange={handleContentChange}
              className={cn(
                "w-full h-full min-h-[calc(100vh-10rem)] resize-none bg-transparent outline-none overflow-hidden",
                `font-${font}`
              )}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineSpacing,
                overflowX: "hidden",
                boxSizing: "border-box",
                fontFamily: getFontFamily(),
              }}
              placeholder="Start writing..."
            />

            {/* Ghost text suggestion */}
            {suggestion && !isProcessing && (
              <div
                className="absolute top-0 left-0 pointer-events-none"
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <span
                  className="invisible"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineSpacing,
                    fontFamily: getFontFamily(),
                  }}
                >
                  {content.substring(
                    0,
                    editorRef.current?.selectionStart || content.length
                  )}
                </span>
                <span
                  className="text-muted-foreground opacity-60"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineSpacing,
                    fontFamily: getFontFamily(),
                  }}
                >
                  {suggestion}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
