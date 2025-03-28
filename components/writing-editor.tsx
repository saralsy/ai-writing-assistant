"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import CommandPalette from "./command-palette";
import DocumentOutline from "./document-outline";
import { useCompletion } from "@ai-sdk/react";
import EditorToolbar from "./editor-toolbar";
import TextEditor from "./text-editor";
import SuggestionFeedback from "./suggestion-feedback";
import { getAISuggestion, executeAICommand } from "@/lib/ai-service";

export default function WritingEditor() {
  // Document state
  const [content, setContent] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [savedStatus, setSavedStatus] = useState("Saved");

  // UI state
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [splitScreen, setSplitScreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Editor settings
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [font, setFont] = useState("inter");

  // AI settings
  const [temperature, setTemperature] = useState(0.7);
  const [writingType, setWritingType] = useState("general");
  const [customInstructions, setCustomInstructions] = useState("");

  // Appearance settings
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showBackgroundLines, setShowBackgroundLines] = useState(false);
  const [lineSpacing_background, setLineSpacingBackground] = useState(24);
  const [lineColor, setLineColor] = useState("#f0f0f0");

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  // AI completion hook
  const { complete, isLoading } = useCompletion({
    api: "/api/ai",
    streamProtocol: "text",
    body: {
      temperature: temperature,
    },
    onResponse: (response) => {
      console.log("AI Response:", response);
    },
    onFinish: (result) => {
      console.log("AI Result:", result);
      setSuggestion(result);
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error("AI completion error:", error);
      setIsProcessing(false);
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (content) {
      setSavedStatus("Saving...");
      const saveTimeout = setTimeout(() => {
        setSavedStatus("Saved");
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [content]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Accept suggestion with Tab
      if (e.key === "Tab" && suggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [suggestion]);

  // Trigger AI suggestions when typing
  useEffect(() => {
    if (content && content.length > 20 && !suggestion && !isProcessing) {
      const lastWord = content.split(" ").pop() || "";
      if (lastWord.length > 3) {
        handleGetAISuggestion();
      }
    }
  }, [content]);

  const handleGetAISuggestion = async () => {
    setIsProcessing(true);

    try {
      // Get cursor position
      let cursorPos = editorRef.current?.selectionStart || content.length;

      // Use the text up to the cursor to generate suggestions
      const contextText = content.substring(0, cursorPos);

      // Send the context to the AI, but request only the new text as a continuation
      const prompt = `Continue the following text with a suggestion. Return ONLY the new content, not the original text: "${contextText}"`;

      // Here we pass the prompt with the adjusted temperature
      const result = await complete(prompt);

      // Only set the suggestion if we got a result
      if (result) {
        setSuggestion(result);
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      // Get cursor position
      const cursorPos = editorRef.current?.selectionStart || content.length;

      // Insert the suggestion at cursor position
      const newContent =
        content.substring(0, cursorPos) +
        suggestion +
        content.substring(cursorPos);

      setContent(newContent);
      setSuggestion("");

      // Optional: Set cursor position after the inserted suggestion
      setTimeout(() => {
        if (editorRef.current) {
          const newCursorPos = cursorPos + suggestion.length;
          editorRef.current.selectionStart = newCursorPos;
          editorRef.current.selectionEnd = newCursorPos;
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  const handleCommand = async (command: string) => {
    setShowCommandPalette(false);
    setIsProcessing(true);

    try {
      const result = await executeAICommand(
        command,
        content,
        customInstructions,
        { temperature, writingType }
      );

      switch (command) {
        case "rewrite":
          // Replace the last sentence with AI rewrite
          const sentences = content.split(". ");
          if (sentences.length > 1) {
            sentences.pop();
            setContent(sentences.join(". ") + ". " + result);
          }
          break;
        case "expand":
          // Add AI expansion to the content
          setContent(content + "\n\n" + result);
          break;
        case "summarize":
          // Show AI summary
          alert("Summary: " + result);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error processing command:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to handle content change and dismiss suggestion
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSuggestion("");
  };

  return (
    <div
      className="flex flex-col h-screen w-full max-w-full overflow-hidden"
      style={{ maxWidth: "100%" }}
    >
      {/* Top toolbar */}
      <EditorToolbar
        savedStatus={savedStatus}
        isProcessing={isProcessing}
        writingType={writingType}
        customInstructions={customInstructions}
        showOutline={showOutline}
        splitScreen={splitScreen}
        setWritingType={setWritingType}
        setCustomInstructions={setCustomInstructions}
        setShowOutline={setShowOutline}
        setSplitScreen={setSplitScreen}
        setShowCommandPalette={setShowCommandPalette}
        font={font}
        setFont={setFont}
        fontSize={fontSize}
        setFontSize={setFontSize}
        lineSpacing={lineSpacing}
        setLineSpacing={setLineSpacing}
        temperature={temperature}
        setTemperature={setTemperature}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        showBackgroundLines={showBackgroundLines}
        setShowBackgroundLines={setShowBackgroundLines}
        lineSpacing_background={lineSpacing_background}
        setLineSpacingBackground={setLineSpacingBackground}
        lineColor={lineColor}
        setLineColor={setLineColor}
      />

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden relative w-full max-w-full">
        {/* Document outline sidebar */}
        {showOutline && (
          <div className="w-64 border-r p-4 overflow-y-auto">
            <DocumentOutline content={content} />
          </div>
        )}

        {/* Editor area */}
        <div
          className={cn(
            "flex-1 flex overflow-hidden max-w-full",
            splitScreen ? "flex-row" : "flex-col"
          )}
        >
          {/* Main editor area */}
          <TextEditor
            content={content}
            suggestion={suggestion}
            isProcessing={isProcessing}
            font={font}
            fontSize={fontSize}
            lineSpacing={lineSpacing}
            backgroundColor={backgroundColor}
            showBackgroundLines={showBackgroundLines}
            lineSpacing_background={lineSpacing_background}
            lineColor={lineColor}
            handleContentChange={handleContentChange}
          />

          {/* Split screen reference panel */}
          {splitScreen && (
            <div className="w-2/5 border-l p-4 overflow-auto">
              <h3 className="font-medium mb-2">Research Panel</h3>
              <p className="text-sm text-muted-foreground">
                Use this panel to reference research materials while writing.
                You can paste content here or use AI to search for relevant
                information.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* AI suggestion feedback */}
      <SuggestionFeedback
        suggestion={suggestion}
        setSuggestion={setSuggestion}
        acceptSuggestion={acceptSuggestion}
      />

      {/* Command palette */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onCommand={handleCommand}
        />
      )}
    </div>
  );
}
