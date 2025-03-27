"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  Sparkles,
  FileText,
  Split,
  ThumbsUp,
  ThumbsDown,
  Command,
  Thermometer,
  Palette,
  LineChart,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import CommandPalette from "./command-palette";
import DocumentOutline from "./document-outline";
import AIStatusIndicator from "./ai-status-indicator";
import { useCompletion } from "@ai-sdk/react";
import { v4 as uuidv4 } from "uuid";
import GhostTextEditor from "./ghost-text";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function WritingEditor() {
  const [content, setContent] = useState<string>("");
  const [suggestion, setSuggestion] = useState<string>("");
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [splitScreen, setSplitScreen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [lineSpacing, setLineSpacing] = useState(1.6);
  const [font, setFont] = useState("inter");
  const [savedStatus, setSavedStatus] = useState("Saved");
  const [temperature, setTemperature] = useState(0.7);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showBackgroundLines, setShowBackgroundLines] = useState(false);
  const [lineSpacing_background, setLineSpacingBackground] = useState(24);
  const [lineColor, setLineColor] = useState("#f0f0f0");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  // Update the AI completion hook with temperature
  const {
    complete,
    completion,
    isLoading,
    input,
    handleInputChange,
    handleSubmit,
  } = useCompletion({
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

  // Update the getAISuggestion function with temperature
  const getAISuggestion = async () => {
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

  // Update the useEffect that triggers suggestions
  useEffect(() => {
    if (content && content.length > 20 && !suggestion && !isProcessing) {
      const lastWord = content.split(" ").pop() || "";
      if (lastWord.length > 3) {
        getAISuggestion();
      }
    }
  }, [content]);

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

  // Update the handleCommand function with temperature
  const handleCommand = async (command: string) => {
    setShowCommandPalette(false);
    setIsProcessing(true);

    try {
      // Create a simpler prompt for the command
      const prompt = `${command} the following text: "${content}"`;

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          temperature: temperature,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process command");
      }

      const result = await response.json();

      switch (command) {
        case "rewrite":
          // Replace the last sentence with AI rewrite
          const sentences = content.split(". ");
          if (sentences.length > 1) {
            sentences.pop();
            setContent(sentences.join(". ") + ". " + result.text);
          }
          break;
        case "expand":
          // Add AI expansion to the content
          setContent(content + "\n\n" + result.text);
          break;
        case "summarize":
          // Show AI summary
          alert("Summary: " + result.text);
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

  // Function to generate CSS for background lines
  const getBackgroundLinesCSS = () => {
    if (!showBackgroundLines) return {};

    return {
      backgroundImage: `linear-gradient(${lineColor} 1px, transparent 1px)`,
      backgroundSize: `100% ${lineSpacing_background}px`,
      backgroundPosition: "0 0",
    };
  };

  return (
    <div
      className="flex flex-col h-screen w-full max-w-full overflow-hidden"
      style={{ maxWidth: "100%" }}
    >
      {/* Top toolbar */}
      <div className="border-b p-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <FileText className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Untitled Document</span>
          <span className="text-xs text-muted-foreground ml-2">
            {savedStatus}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <AIStatusIndicator isProcessing={isProcessing} />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOutline(!showOutline)}
            className={cn(showOutline && "bg-accent")}
          >
            <FileText className="h-4 w-4 mr-1" />
            <span className="sr-only md:not-sr-only md:inline-block">
              Outline
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSplitScreen(!splitScreen)}
            className={cn(splitScreen && "bg-accent")}
          >
            <Split className="h-4 w-4 mr-1" />
            <span className="sr-only md:not-sr-only md:inline-block">
              Split
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandPalette(true)}
          >
            <Command className="h-4 w-4 mr-1" />
            <span className="sr-only md:not-sr-only md:inline-block">
              Commands
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                <span className="sr-only md:not-sr-only md:inline-block">
                  Settings
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4 space-y-4">
                <Tabs defaultValue="editor">
                  <TabsList className="w-full">
                    <TabsTrigger value="editor" className="flex-1">
                      Editor
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="flex-1">
                      AI
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex-1">
                      Appearance
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="editor" className="mt-4 space-y-4">
                    <h4 className="font-medium">Editor Settings</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Font</span>
                        <Select value={font} onValueChange={setFont}>
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="georgia">Georgia</SelectItem>
                            <SelectItem value="courier">Courier</SelectItem>
                            <SelectItem value="helvetica">Helvetica</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">
                            Font Size: {fontSize}px
                          </span>
                        </div>
                        <Slider
                          value={[fontSize]}
                          min={12}
                          max={24}
                          step={1}
                          onValueChange={(value) => setFontSize(value[0])}
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">
                            Line Spacing: {lineSpacing.toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[lineSpacing]}
                          min={1.0}
                          max={2.5}
                          step={0.1}
                          onValueChange={(value) => setLineSpacing(value[0])}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4 space-y-4">
                    <h4 className="font-medium">AI Settings</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-2" />
                            <span className="text-sm">
                              Temperature: {temperature.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Precise</span>
                          <Slider
                            value={[temperature]}
                            min={0.1}
                            max={1.0}
                            step={0.1}
                            className="flex-1"
                            onValueChange={(value) => setTemperature(value[0])}
                          />
                          <span className="text-xs">Creative</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Lower values create more deterministic suggestions,
                          higher values increase creativity
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="appearance" className="mt-4 space-y-4">
                    <h4 className="font-medium">Appearance Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="bg-color" className="text-sm">
                          Background Color
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="bg-color"
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-10 h-8 p-0 border cursor-pointer"
                          />
                          <Input
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-24 h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="bg-lines"
                          className="text-sm flex items-center"
                        >
                          <LineChart className="h-4 w-4 mr-2" />
                          Background Lines
                        </Label>
                        <Switch
                          id="bg-lines"
                          checked={showBackgroundLines}
                          onCheckedChange={setShowBackgroundLines}
                        />
                      </div>

                      {showBackgroundLines && (
                        <>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm">
                                Line Spacing: {lineSpacing_background}px
                              </span>
                            </div>
                            <Slider
                              value={[lineSpacing_background]}
                              min={16}
                              max={48}
                              step={2}
                              onValueChange={(value) =>
                                setLineSpacingBackground(value[0])
                              }
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <Label htmlFor="line-color" className="text-sm">
                              Line Color
                            </Label>
                            <div className="flex items-center gap-2">
                              <Input
                                id="line-color"
                                type="color"
                                value={lineColor}
                                onChange={(e) => setLineColor(e.target.value)}
                                className="w-10 h-8 p-0 border cursor-pointer"
                              />
                              <Input
                                value={lineColor}
                                onChange={(e) => setLineColor(e.target.value)}
                                className="w-24 h-8 text-xs"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

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
          {/* Main editor area with direct textarea implementation */}
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
      {suggestion && (
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
      )}

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
