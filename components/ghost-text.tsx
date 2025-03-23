import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

const GhostTextEditor = ({
  content,
  suggestion,
  isProcessing,
  onChange,
  onAcceptSuggestion,
  fontSize,
  lineSpacing,
  font,
  placeholder,
  ...props
}: {
  content: string;
  suggestion: string;
  isProcessing: boolean;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onAcceptSuggestion: () => void;
  fontSize: number;
  lineSpacing: number;
  font: string;
  placeholder: string;
  [key: string]: any;
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPos, setCursorPos] = useState(0);

  // Track cursor position changes
  const handleCursorChange = () => {
    if (editorRef.current) {
      setCursorPos(editorRef.current.selectionStart);
    }
  };

  // Calculate ghost text position
  const getGhostText = () => {
    if (!suggestion || isProcessing) return null;

    // Get text up to cursor position
    const textBeforeCursor = content.substring(0, cursorPos);
    // Get the line the cursor is on
    const lines = textBeforeCursor.split("\n");
    const currentLine = lines[lines.length - 1];

    return suggestion;
  };

  // Keep track of cursor position during typing
  useEffect(() => {
    if (editorRef.current) {
      const currentCursor = editorRef.current.selectionStart;
      setCursorPos(currentCursor);
    }
  }, [content]);
  // Render the editor and ghost text
  return (
    <div className="flex-1 relative overflow-auto bg-background">
      <div className="relative min-h-full">
        <div className="absolute top-0 left-0 right-0 bottom-0 p-8">
          <div className="relative">
            {/* Main textarea for user input */}
            <textarea
              ref={editorRef}
              value={content}
              onChange={onChange}
              onSelect={handleCursorChange}
              onClick={handleCursorChange}
              onKeyUp={handleCursorChange}
              className={cn(
                "w-full h-full min-h-[calc(100vh-10rem)] resize-none bg-transparent outline-none",
                `font-${font}`
              )}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineSpacing,
              }}
              placeholder={placeholder}
            />

            {/* Ghost text overlay that only shows the suggestion */}
            {suggestion && !isProcessing && (
              <div
                className="absolute pointer-events-none"
                style={{
                  top: 0,
                  left: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {/* Invisible span to position the suggestion correctly */}
                <span
                  className="invisible"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineSpacing,
                    fontFamily:
                      font === "inter"
                        ? "Inter, sans-serif"
                        : font === "georgia"
                        ? "Georgia, serif"
                        : font === "courier"
                        ? "Courier, monospace"
                        : "Helvetica, sans-serif",
                  }}
                >
                  {content.substring(0, cursorPos)}
                </span>

                {/* Visible suggestion */}
                <span
                  className="text-muted-foreground opacity-60"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: lineSpacing,
                    fontFamily:
                      font === "inter"
                        ? "Inter, sans-serif"
                        : font === "georgia"
                        ? "Georgia, serif"
                        : font === "courier"
                        ? "Courier, monospace"
                        : "Helvetica, sans-serif",
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
};

export default GhostTextEditor;
