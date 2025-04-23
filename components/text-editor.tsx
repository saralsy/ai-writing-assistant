import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TextSelectionToolbar } from "./text-selection-toolbar";
import { WandSparkles } from "lucide-react";
import { Button } from "./ui/button";

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
  handleCursorChange?: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void;
  isEnhancing: boolean;
  applyVersion: (versionContent: string) => void;
  compareWithCurrentVersion: (
    versionContent: string,
    description: string
  ) => void;
  aiEnabled: boolean;
  onExpandSelection?: (
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => void;
  onRewriteSelection?: (
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => void;
  onImproveSelection?: (
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => void;
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
  handleCursorChange,
  isEnhancing,
  applyVersion,
  compareWithCurrentVersion,
  aiEnabled,
  onExpandSelection,
  onRewriteSelection,
  onImproveSelection,
}: TextEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const suggestionContainerRef = useRef<HTMLDivElement>(null);
  const [selectionRange, setSelectionRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  // Debug state for selection
  const [hasSelection, setHasSelection] = useState(false);
  const [selectionButtonPosition, setSelectionButtonPosition] = useState({
    top: 0,
    left: 0,
  });

  // Decide whether to show AI suggestions based on selection state and cursor position
  const shouldShowSuggestion =
    suggestion &&
    !isProcessing &&
    aiEnabled &&
    !isEnhancing &&
    !hasSelection &&
    editorRef.current?.selectionStart === content.length;

  // Sync scroll between editor and suggestion container
  useEffect(() => {
    const syncScroll = () => {
      if (editorRef.current && suggestionContainerRef.current) {
        // Make sure the scrolling positions match exactly
        suggestionContainerRef.current.scrollTop = editorRef.current.scrollTop;
        suggestionContainerRef.current.scrollLeft =
          editorRef.current.scrollLeft;
      }
    };

    const editor = editorRef.current;
    if (editor) {
      // Listen for all events that might affect scrolling
      editor.addEventListener("scroll", syncScroll);
      editor.addEventListener("input", syncScroll);
      editor.addEventListener("keydown", syncScroll);
      editor.addEventListener("keyup", syncScroll);
      editor.addEventListener("click", syncScroll);
      editor.addEventListener("select", syncScroll);

      // Initial sync
      syncScroll();
    }

    return () => {
      if (editor) {
        editor.removeEventListener("scroll", syncScroll);
        editor.removeEventListener("input", syncScroll);
        editor.removeEventListener("keydown", syncScroll);
        editor.removeEventListener("keyup", syncScroll);
        editor.removeEventListener("click", syncScroll);
        editor.removeEventListener("select", syncScroll);
      }
    };
  }, [suggestion, content]);

  // Helper to re-sync suggestion when needed
  const resyncSuggestion = () => {
    if (editorRef.current && suggestionContainerRef.current) {
      // Force synchronization of scroll positions
      suggestionContainerRef.current.scrollTop = editorRef.current.scrollTop;
      suggestionContainerRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  // Force refresh suggestion display when cursor position changes
  useEffect(() => {
    // If there's a suggestion, make sure it's correctly positioned
    if (shouldShowSuggestion) {
      // Force a redraw by triggering an update
      const forceUpdateTimeout = setTimeout(() => {
        resyncSuggestion();
      }, 0);

      return () => clearTimeout(forceUpdateTimeout);
    }
  }, [editorRef.current?.selectionStart, shouldShowSuggestion]);

  // Also resync on window resize
  useEffect(() => {
    const handleResize = () => {
      resyncSuggestion();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Track selection changes
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    console.log("handleSelect event fired");
    if (editorRef.current) {
      const { selectionStart, selectionEnd } = editorRef.current;
      console.log("Selection detected:", {
        selectionStart,
        selectionEnd,
        hasSelection: selectionStart !== selectionEnd,
        selectedText:
          selectionStart !== selectionEnd
            ? content.substring(selectionStart, selectionEnd)
            : "",
      });

      if (selectionStart !== selectionEnd) {
        setSelectionRange({ start: selectionStart, end: selectionEnd });
        setHasSelection(true);

        // Force dispatch a selection change event to help the toolbar detect it
        setTimeout(() => {
          const event = new Event("selectionchange", { bubbles: true });
          document.dispatchEvent(event);
        }, 10);

        // Calculate position for the selection button based on selection position
        const textarea = editorRef.current;
        const textareaRect = textarea.getBoundingClientRect();

        // Get text before the selection to count lines
        const textBefore = textarea.value.substring(0, selectionStart);
        const linesBefore = textBefore.split("\n").length;

        // Calculate styles
        const computedStyle = window.getComputedStyle(textarea);
        const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;

        // Adjust for scroll position
        const scrollTop = textarea.scrollTop;

        // Calculate the estimated position - place at the beginning of the selection
        const estimatedTop =
          textareaRect.top + paddingTop + linesBefore * lineHeight - scrollTop;

        // Button positioned near the end of selected text for easy access
        setSelectionButtonPosition({
          top: estimatedTop - 30, // Position above the selection
          left: textareaRect.right - 100, // Positioned at the right side of the editor
        });
      } else {
        setHasSelection(false);
        setSelectionRange(null);
      }
    }
  };

  // Force trigger toolbar to appear
  const forceShowToolbar = () => {
    console.log("Force showing toolbar");
    if (editorRef.current && selectionRange) {
      // Make sure the text is still selected
      const { selectionStart, selectionEnd } = editorRef.current;
      if (selectionStart !== selectionEnd) {
        // Dispatch events that might trigger the toolbar
        setTimeout(() => {
          const mouseEvent = new MouseEvent("mouseup", {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          editorRef.current?.dispatchEvent(mouseEvent);

          const selectionEvent = new Event("selectionchange", {
            bubbles: true,
          });
          document.dispatchEvent(selectionEvent);
        }, 50);
      }
    }
  };

  // Monitor mouseup events on the textarea
  useEffect(() => {
    const handleMouseUp = () => {
      console.log("Textarea mouseup detected");
      if (editorRef.current) {
        const { selectionStart, selectionEnd } = editorRef.current;
        if (selectionStart !== selectionEnd) {
          setSelectionRange({ start: selectionStart, end: selectionEnd });
          setHasSelection(true);
          console.log("Selection on mouseup:", {
            selectionStart,
            selectionEnd,
            selectedText: content.substring(selectionStart, selectionEnd),
          });
        }
      }
    };

    const textarea = editorRef.current;
    if (textarea) {
      textarea.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("mouseup", handleMouseUp);
      }
    };
  }, [content]);

  // Update suggestion visibility when cursor position changes
  useEffect(() => {
    const updateCursorPosition = () => {
      if (
        editorRef.current &&
        editorRef.current.selectionStart !== content.length &&
        suggestion
      ) {
        // Clear suggestion when cursor is not at the end of text
        // Simply using direct DOM events rather than synthetic events
        document.dispatchEvent(new CustomEvent("clearSuggestion"));
      }
    };

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("click", updateCursorPosition);
      editor.addEventListener("keyup", updateCursorPosition);
      editor.addEventListener("keydown", updateCursorPosition);
    }

    return () => {
      if (editor) {
        editor.removeEventListener("click", updateCursorPosition);
        editor.removeEventListener("keyup", updateCursorPosition);
        editor.removeEventListener("keydown", updateCursorPosition);
      }
    };
  }, [content, suggestion]);

  // Add keyboard listener to clear suggestions on arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear suggestion on any arrow key press or when moving cursor with home/end/pgup/pgdown
      if (
        suggestion &&
        (e.key === "ArrowLeft" ||
          e.key === "ArrowRight" ||
          e.key === "ArrowUp" ||
          e.key === "ArrowDown" ||
          e.key === "Home" ||
          e.key === "End" ||
          e.key === "PageUp" ||
          e.key === "PageDown")
      ) {
        document.dispatchEvent(new CustomEvent("clearSuggestion"));
      }
    };

    // Add listener to handle keyboard navigation
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [suggestion]);

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

  // Handlers for selection actions
  const handleExpandSelection = (selectedText: string) => {
    if (onExpandSelection && selectionRange) {
      onExpandSelection(selectedText, selectionRange.start, selectionRange.end);
    }
  };

  const handleRewriteSelection = (selectedText: string) => {
    if (onRewriteSelection && selectionRange) {
      onRewriteSelection(
        selectedText,
        selectionRange.start,
        selectionRange.end
      );
    }
  };

  const handleImproveSelection = (selectedText: string) => {
    if (onImproveSelection && selectionRange) {
      onImproveSelection(
        selectedText,
        selectionRange.start,
        selectionRange.end
      );
    }
  };

  // Helper to calculate exact cursor position
  const getCursorCoordinates = () => {
    if (!editorRef.current) return { left: 0, top: 0 };

    const textarea = editorRef.current;
    const selectionStart = textarea.selectionStart;

    // Create a dummy element to measure text dimensions
    const mirror = document.createElement("div");

    // Copy all styles that affect text layout
    const style = window.getComputedStyle(textarea);
    const properties = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "letterSpacing",
      "lineHeight",
      "textIndent",
      "whiteSpace",
      "wordSpacing",
      "paddingLeft",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "boxSizing",
      "borderLeftWidth",
      "borderTopWidth",
    ];

    properties.forEach((prop) => {
      // @ts-ignore - dynamic property access
      mirror.style[prop] = style[prop];
    });

    // Set specific styles for accurate measurement
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.height = "auto";
    mirror.style.whiteSpace = "pre-wrap";
    mirror.style.wordWrap = "break-word";
    mirror.style.overflow = "hidden";

    // Get text up to the cursor
    const textBeforeCursor = textarea.value.substring(0, selectionStart);

    // Create a span to hold this text
    const textNode = document.createTextNode(textBeforeCursor);
    const span = document.createElement("span");
    span.appendChild(textNode);
    mirror.appendChild(span);

    // Add a marker at cursor position
    const marker = document.createElement("span");
    marker.textContent = "|";
    marker.style.display = "inline-block";
    marker.style.width = "0px";
    marker.style.overflow = "hidden";
    mirror.appendChild(marker);

    // Add to document to measure
    document.body.appendChild(mirror);

    // Get positions
    const markerRect = marker.getBoundingClientRect();
    const mirrorRect = mirror.getBoundingClientRect();

    // Cleanup
    document.body.removeChild(mirror);

    // Return coordinates relative to textarea
    return {
      left: markerRect.left - mirrorRect.left + textarea.scrollLeft,
      top: markerRect.top - mirrorRect.top + textarea.scrollTop,
    };
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
            {/* Text area wrapper */}
            <div
              className={cn(
                "relative w-full h-full",
                isEnhancing && "shimmer-container"
              )}
            >
              <textarea
                ref={editorRef}
                value={content}
                onChange={handleContentChange}
                onSelect={(e) => {
                  handleSelect(e);
                  handleCursorChange?.(e);
                }}
                onClick={handleCursorChange}
                className={cn(
                  "w-full h-full min-h-[calc(100vh-10rem)] resize-none bg-transparent outline-none overflow-hidden",
                  `font-${font}`,
                  isEnhancing && "mono-shimmer-text"
                )}
                style={{
                  fontSize: `${fontSize}px`,
                  lineHeight: lineSpacing,
                  overflowX: "hidden",
                  boxSizing: "border-box",
                  fontFamily: getFontFamily(),
                  caretColor: "currentColor",
                  padding: "8px",
                }}
                placeholder="Start writing..."
                disabled={isEnhancing}
                spellCheck="true"
              />
            </div>

            {/* Ghost text suggestion - only show when cursor is at end of text */}
            {shouldShowSuggestion &&
              editorRef.current?.selectionStart === content.length && (
                <div
                  ref={suggestionContainerRef}
                  className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
                  style={{
                    overflowY: "auto",
                    overscrollBehavior: "none",
                    boxSizing: "border-box",
                    zIndex: 5, // Just above the textarea content
                    padding: "8px", // Match textarea padding
                  }}
                >
                  {/* Overlay that mimics the textarea exactly */}
                  <div
                    className="whitespace-pre-wrap break-words w-full h-full"
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: lineSpacing,
                      fontFamily: getFontFamily(),
                      boxSizing: "border-box",
                      position: "relative",
                    }}
                  >
                    {/* Content before cursor - render as invisible */}
                    <span className="invisible">{content}</span>

                    {/* The suggestion - visible and styled */}
                    <span
                      className="text-muted-foreground relative group"
                      style={{
                        opacity: 0.65,
                        textShadow: "0 0 0 rgba(0,0,0,0.2)",
                        fontWeight: "inherit",
                        borderLeft: "2px solid transparent", // Subtle left border as separation
                        paddingLeft: "1px",
                        transition: "opacity 0.15s ease",
                      }}
                    >
                      {suggestion}
                      <span className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-background border text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap shadow-sm">
                        Press Tab to accept
                      </span>
                    </span>
                  </div>
                </div>
              )}

            {/* Text selection toolbar */}
            {aiEnabled && !isEnhancing && !isProcessing && (
              <TextSelectionToolbar
                onExpand={handleExpandSelection}
                onRewrite={handleRewriteSelection}
                onImprove={handleImproveSelection}
                editorRef={editorRef}
              />
            )}

            {/* Alternate button to show toolbar */}
            {hasSelection && aiEnabled && !isEnhancing && !isProcessing && (
              <Button
                variant="outline"
                size="sm"
                className="fixed z-[100] px-2.5 py-1 h-7 flex items-center gap-1 shadow-md rounded-full bg-background/90 backdrop-blur-sm border animate-fade-in"
                style={{
                  top: `${selectionButtonPosition.top}px`,
                  left: `${selectionButtonPosition.left}px`,
                }}
                onClick={forceShowToolbar}
              >
                <WandSparkles className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium">AI Actions</span>
              </Button>
            )}

            {/* Debug indicator for selection - only show in development */}
            {process.env.NODE_ENV === "development" && hasSelection && (
              <div className="fixed top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs z-[200]">
                Text Selected:{" "}
                {selectionRange
                  ? content
                      .substring(selectionRange.start, selectionRange.end)
                      .slice(0, 20) + "..."
                  : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add global styles for the shimmer effect */}
      <style jsx global>{`
        .mono-shimmer-text {
          background-image: linear-gradient(
            90deg,
            rgba(24, 24, 27, 0.8) 0%,
            rgba(255, 255, 255, 0.9) 25%,
            rgba(161, 161, 170, 0.7) 50%,
            rgba(24, 24, 27, 0.8) 100%
          );
          background-size: 200% 100%;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          animation: mono-shimmer 3s infinite ease-in-out;
        }

        @keyframes mono-shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
