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
import {
  getAISuggestion,
  executeAICommand,
  enhanceText,
} from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { modelOptions } from "@/lib/model-options";
import { InlineAIIndicator } from "./inline-ai-indicator";

// Add interface for document type
interface SavedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

// Update the props interface
interface WritingEditorProps {
  documentId: string;
  savedDocuments: SavedDocument[];
  onSaveDocument: (doc: SavedDocument) => void;
  currentDocument: SavedDocument | undefined;
  setSavedDocuments: (docs: SavedDocument[]) => void;
  setDocumentId: (id: string) => void;
}

export default function WritingEditor({
  documentId,
  savedDocuments,
  onSaveDocument,
  currentDocument,
  setSavedDocuments,
  setDocumentId,
}: WritingEditorProps) {
  // Document state
  const [content, setContent] = useState<string>(
    currentDocument?.content || ""
  );
  const [suggestion, setSuggestion] = useState<string>("");
  const [savedStatus, setSavedStatus] = useState("Saved");
  const [documentTitle, setDocumentTitle] = useState(
    currentDocument?.title || "Untitled Document"
  );
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

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
  const [aiModel, setAiModel] = useState<string>("claude-3-sonnet");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [aiEnabled, setAiEnabled] = useState(true);
  // Appearance settings
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showBackgroundLines, setShowBackgroundLines] = useState(false);
  const [lineSpacing_background, setLineSpacingBackground] = useState(24);
  const [lineColor, setLineColor] = useState("#f0f0f0");

  // Version history
  const [versionHistory, setVersionHistory] = useState<
    {
      id: string;
      content: string;
      timestamp: Date;
      description: string;
    }[]
  >([]);
  const [currentVersion, setCurrentVersion] = useState<string>("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    before: string;
    after: string;
    description: string;
  } | null>(null);
  const [showVersionCompare, setShowVersionCompare] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const { toast } = useToast();
  const [currentModel, setCurrentModel] = useState("claude-3-sonnet");
  const [modelReturnedSameResult, setModelReturnedSameResult] = useState(false);
  const [failedModels, setFailedModels] = useState<Set<string>>(new Set());

  // Track text selection processing
  const [selectionProcessing, setSelectionProcessing] = useState(false);
  const [selectionAction, setSelectionAction] = useState<string>("");
  const [selectionPosition, setSelectionPosition] = useState({
    top: 0,
    left: 0,
  });

  // Available AI models to cycle through - using values from modelOptions
  const availableModels = modelOptions.map((model) => model.value);

  // Get next available model that hasn't failed
  const getNextAvailableModel = (currentModel: string): string => {
    // Make sure currentModel is valid
    if (!currentModel || !availableModels.includes(currentModel)) {
      console.warn(
        `Invalid current model: "${currentModel}". Defaulting to first available model.`
      );
      return availableModels[0];
    }

    // Create a copy of the failed models set to work with
    const failedModelsCopy = new Set(failedModels);

    // Add the current model to failed models
    failedModelsCopy.add(currentModel);

    // Find models that haven't failed yet
    const availableOptions = availableModels.filter(
      (model) => !failedModelsCopy.has(model)
    );

    if (availableOptions.length === 0) {
      // If all models have failed, reset and start over with the first model
      setFailedModels(new Set());
      console.log("All models have been tried. Resetting failed models list.");
      return availableModels[0];
    }

    // Get the next model in the list
    const currentIndex = availableModels.indexOf(currentModel);

    // Loop through models starting from the next one
    for (let i = 1; i < availableModels.length; i++) {
      const nextIndex = (currentIndex + i) % availableModels.length;
      const nextModel = availableModels[nextIndex];

      if (!failedModelsCopy.has(nextModel)) {
        return nextModel;
      }
    }

    // Fallback to first available model if nothing else is found
    return availableOptions[0] || availableModels[0]; // Double safety check
  };

  // Reset failed models when the document changes
  useEffect(() => {
    setFailedModels(new Set());
  }, [documentId]);

  // AI completion hook
  const { complete, isLoading } = useCompletion({
    api: "/api/ai",
    streamProtocol: "text",
    body: {
      temperature: temperature,
      model: aiModel,
      customInstructions: customInstructions,
      writingType: writingType,
    },
    onResponse: (response) => {
      // console.log("AI Response:", response);
    },
    onFinish: (result) => {
      // console.log("AI Result:", result);
      // Only set suggestion if result is valid
      if (result && result.trim() !== "") {
        setSuggestion(result);
      } else {
        console.warn("AI returned empty result, not setting suggestion");
      }
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error("AI completion error:", error);
      setIsProcessing(false);
    },
  });

  // Initialize aiModel with a valid value on first render
  useEffect(() => {
    // Make sure aiModel starts with a valid value
    if (!aiModel || !availableModels.includes(aiModel)) {
      console.log("Setting default model:", availableModels[0]);
      setAiModel(availableModels[0]);
    }
  }, []);

  // Keep currentModel in sync with aiModel
  useEffect(() => {
    // Ensure aiModel is valid before syncing
    if (aiModel && availableModels.includes(aiModel)) {
      setCurrentModel(aiModel);
    } else if (aiModel) {
      console.warn(`Invalid model "${aiModel}" detected, reverting to default`);
      setAiModel(availableModels[0]);
    }
  }, [aiModel]);

  // Load saved documents on initial render
  useEffect(() => {
    loadSavedDocuments();

    // Check if there's a document ID in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const docId = urlParams.get("id");

    if (docId) {
      loadDocument(docId);
    } else {
      // Create a new document if none is specified
      createNewDocument();
    }
  }, []);

  // Update when currentDocument changes
  useEffect(() => {
    if (currentDocument) {
      setContent(currentDocument.content || "");
      setDocumentTitle(currentDocument.title || "Untitled Document");
      // Set cursor position to the end of content
      setCursorPosition((currentDocument.content || "").length);
    } else {
      setContent("");
      setDocumentTitle("Untitled Document");
      setCursorPosition(0);
    }
    // Clear any existing suggestions when switching documents
    setSuggestion("");
  }, [currentDocument]);

  // Auto-save functionality
  useEffect(() => {
    if (content || documentTitle !== "Untitled Document") {
      setSavedStatus("Saving...");
      const saveTimeout = setTimeout(() => {
        saveDocument();
        setSavedStatus("Saved");
      }, 1000);
      return () => clearTimeout(saveTimeout);
    }
  }, [content, documentTitle]);

  // Load all saved documents from localStorage
  const loadSavedDocuments = () => {
    try {
      const savedDocs = localStorage.getItem("savedDocuments");
      if (savedDocs) {
        setSavedDocuments(JSON.parse(savedDocs));
      }
    } catch (error) {
      console.error("Error loading saved documents:", error);
    }
  };

  // Save current document
  const saveDocument = () => {
    if (!documentId) return;

    try {
      // Create the document object
      const doc: SavedDocument = {
        id: documentId,
        title: documentTitle || "Untitled Document",
        content: content || "",
        lastModified: Date.now(),
      };

      // Call the parent's save function
      onSaveDocument(doc);
    } catch (error) {
      console.error("Error saving document:", error);
      setSavedStatus("Error saving");
    }
  };

  // Load a specific document by ID
  const loadDocument = (id: string) => {
    try {
      const doc = savedDocuments.find((doc) => doc.id === id);
      if (doc) {
        setDocumentId(doc.id);
        setDocumentTitle(doc.title);
        setContent(doc.content);
        // Reset version history when loading a new document
        setVersionHistory([]);
        setCurrentVersion("");
        // Update URL
        updateUrlWithDocumentId(id);
      }
    } catch (error) {
      console.error("Error loading document:", error);
    }
  };

  // Create a new document - add this to clear suggestions
  const createNewDocument = () => {
    // Generate a new ID
    const newId = Date.now().toString();

    // Create a new document object
    const newDoc: SavedDocument = {
      id: newId,
      title: "Untitled Document",
      content: "",
      lastModified: Date.now(),
    };

    // Update the documents list
    const updatedDocs = [...savedDocuments, newDoc];
    setSavedDocuments(updatedDocs);
    localStorage.setItem("savedDocuments", JSON.stringify(updatedDocs));

    // Set the current document ID
    setDocumentId(newId);

    // Reset the editor state
    setContent("");
    setDocumentTitle("Untitled Document");
    setSuggestion("");

    // Reset version history
    setVersionHistory([]);
    setCurrentVersion("");

    // Update URL
    updateUrlWithDocumentId(newId);
  };

  // Delete a document
  const deleteDocument = (id: string) => {
    try {
      // Get the latest documents from localStorage to ensure we're working with fresh data
      const savedDocsString = localStorage.getItem("savedDocuments");
      let docsToFilter = savedDocuments;

      if (savedDocsString) {
        try {
          docsToFilter = JSON.parse(savedDocsString);
        } catch (e) {
          console.error("Error parsing documents from localStorage:", e);
        }
      }

      const updatedDocs = docsToFilter.filter((doc) => doc.id !== id);

      // Update both state and localStorage with the filtered documents
      setSavedDocuments(updatedDocs);
      localStorage.setItem("savedDocuments", JSON.stringify(updatedDocs));

      // If the current document was deleted, create a new one
      if (id === documentId) {
        createNewDocument();
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Update URL with document ID for bookmarking/sharing
  const updateUrlWithDocumentId = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.replaceState({}, "", url);
  };

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
    // Only trigger suggestions if AI is enabled and we have enough content
    if (
      !aiEnabled ||
      isProcessing ||
      suggestion ||
      !content ||
      modelReturnedSameResult
    ) {
      return;
    }

    // Only get suggestions if cursor is at the end of the text
    if (cursorPosition !== content.length) {
      return;
    }

    // Require longer content before triggering suggestions
    if (content.length > 30) {
      // Check if user has paused typing
      const typingTimeout = setTimeout(() => {
        // Don't get suggestions if we already have one or we're processing
        if (!suggestion && !isProcessing) {
          handleGetAISuggestion();
        }
      }, 1500); // Wait 1.5 seconds after typing stops

      return () => clearTimeout(typingTimeout);
    }
  }, [
    content,
    aiEnabled,
    isProcessing,
    suggestion,
    modelReturnedSameResult,
    cursorPosition,
  ]);

  const handleGetAISuggestion = async () => {
    setIsProcessing(true);

    try {
      // Use cursor position from state
      let cursorPos = cursorPosition !== null ? cursorPosition : content.length;

      // Only get suggestions if cursor is at the end of the text
      if (cursorPos !== content.length) {
        console.log("Cursor not at end of text, skipping AI suggestion");
        setIsProcessing(false);
        return;
      }

      // Use the text up to the cursor to generate suggestions
      const contextText = content.substring(0, cursorPos);

      // Don't send too short content to AI
      if (contextText.trim().length < 10) {
        console.log("Context text too short, skipping AI suggestion");
        setIsProcessing(false);
        return;
      }

      // Ensure we're using a valid model
      if (!aiModel || !availableModels.includes(aiModel)) {
        console.warn(
          `Invalid model detected: "${aiModel}", reverting to default model`
        );
        setAiModel(availableModels[0]);
        setIsProcessing(false);
        return;
      }

      console.log(`Sending text to AI using model: ${aiModel}`);

      // Send ONLY the context text without any additional instructions
      // The instructions should be handled on the server side in the system message
      const result = await complete(contextText);
      console.log("Result from AI:", result);

      // Only set the suggestion if we got a result that's different from input
      if (result && result.trim() !== "" && result !== contextText) {
        setSuggestion(result);
        // Reset the flag when we get a good response
        setModelReturnedSameResult(false);
      } else {
        if (!result || result === contextText) {
          // Add current model to failed models set
          setFailedModels((prevFailedModels) => {
            const newFailedModels = new Set(prevFailedModels);
            newFailedModels.add(aiModel);
            return newFailedModels;
          });

          // Set flag to prevent retrying with same model
          setModelReturnedSameResult(true);

          console.log("Showing toast for AI model result issue:", {
            model: aiModel,
            resultLength: result ? result.length : 0,
            isSame: result === contextText,
            failedModels: Array.from(failedModels),
          });

          // Get next available model that hasn't failed
          const nextModel = getNextAvailableModel(aiModel);

          // Safety check to ensure nextModel is valid
          if (!nextModel || !availableModels.includes(nextModel)) {
            console.error(
              `Invalid next model: "${nextModel}". Falling back to first model.`
            );
            const fallbackModel = availableModels[0];

            // Function to switch models with safety check
            const safeSwitch = (modelToUse: string) => {
              console.log(`Switching to model: ${modelToUse}`);

              // Get friendly model name
              const modelOption = modelOptions.find(
                (m) => m.value === modelToUse
              );
              const modelLabel = modelOption?.label || modelToUse;

              setAiModel(modelToUse);
              setCurrentModel(modelToUse);
              setModelReturnedSameResult(false);

              toast({
                title: "Model switched",
                description: `Now using ${modelLabel}. Suggestions will resume automatically.`,
              });
            };

            // Switch to fallback model
            safeSwitch(fallbackModel);
            return;
          }

          // Function to switch models
          const switchToNextModel = () => {
            console.log(
              `Automatically switching from ${aiModel} to ${nextModel}`
            );

            // Find model labels for better display
            const currentModelOption = modelOptions.find(
              (m) => m.value === aiModel
            );
            const nextModelOption = modelOptions.find(
              (m) => m.value === nextModel
            );

            const currentModelLabel = currentModelOption?.label || aiModel;
            const nextModelLabel = nextModelOption?.label || nextModel;

            // Switch to the next available model
            setAiModel(nextModel);
            setCurrentModel(nextModel);
            // Reset the flag when model is changed
            setModelReturnedSameResult(false);

            toast({
              title: "Model automatically switched",
              description: `Switched from ${currentModelLabel} to ${nextModelLabel}. Suggestions will resume automatically.`,
            });
          };

          // Set a timer to auto-switch models after 8 seconds if user doesn't click
          const autoSwitchTimer = setTimeout(switchToNextModel, 8000);

          // Find friendly model names for toast
          const currentModelOption = modelOptions.find(
            (m) => m.value === aiModel
          );
          const nextModelOption = modelOptions.find(
            (m) => m.value === nextModel
          );

          const currentModelLabel = currentModelOption?.label || aiModel;
          const nextModelLabel = nextModelOption?.label || nextModel;

          toast({
            title: "AI couldn't generate a useful suggestion",
            description: `${currentModelLabel} returned the same text or an empty result. Will automatically switch to ${nextModelLabel} in 8 seconds.`,
            variant: "destructive",
            action: (
              <ToastAction
                altText="Switch Model Now"
                onClick={() => {
                  console.log(
                    "Toast action clicked - switching model immediately"
                  );
                  // Clear the auto-switch timer
                  clearTimeout(autoSwitchTimer);

                  // Switch to the next available model
                  setAiModel(nextModel);
                  setCurrentModel(nextModel);
                  // Reset the flag when model is changed
                  setModelReturnedSameResult(false);

                  toast({
                    title: "Model switched",
                    description: `Switched to ${nextModelLabel}. Suggestions will resume automatically.`,
                  });
                }}
              >
                Switch Now
              </ToastAction>
            ),
          });
        }
        setIsProcessing(false);
        setSuggestion("");

        console.error("AI returned the same text or empty result", {
          inputLength: contextText.length,
          resultLength: result ? result.length : 0,
          isSame: result === contextText,
          failedModels: Array.from(failedModels),
        });

        return;
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      setModelReturnedSameResult(false); // Reset on error to allow retrying
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptSuggestion = () => {
    if (suggestion) {
      // Get cursor position
      const cursorPos =
        cursorPosition !== null ? cursorPosition : content.length;

      // Insert the suggestion at cursor position
      const newContent =
        content.substring(0, cursorPos) +
        suggestion +
        content.substring(cursorPos);

      setContent(newContent);
      setSuggestion("");

      // Update cursor position to after the inserted suggestion
      const newCursorPos = cursorPos + suggestion.length;
      setCursorPosition(newCursorPos);

      // Optional: Set cursor position after the inserted suggestion
      setTimeout(() => {
        if (editorRef.current) {
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
    setCursorPosition(e.target.selectionStart);
  };

  // Function to track cursor movement
  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.currentTarget.selectionStart);

    // If cursor is not at the end, clear any existing suggestion
    if (e.currentTarget.selectionStart !== content.length && suggestion) {
      setSuggestion("");
    }
  };

  // Save current version to history
  const saveToVersionHistory = (description: string) => {
    const newVersion = {
      id: Date.now().toString(),
      content: content,
      timestamp: new Date(),
      description,
    };
    setVersionHistory((prev) => [newVersion, ...prev]);
  };

  // Function to enhance the text, without AI suggestions
  const handleEnhanceText = async () => {
    if (!content.trim()) return;

    // Save current version before enhancement
    saveToVersionHistory("Before AI enhancement");

    setIsEnhancing(true);
    setIsProcessing(true);

    try {
      const originalContent = content;
      const enhancedContent = await enhanceText(
        content,
        writingType,
        customInstructions
      );

      // Set up comparison
      setCompareVersions({
        before: originalContent,
        after: enhancedContent,
        description: "AI Enhancement",
      });

      // Show comparison dialog
      setShowVersionCompare(true);

      // Update content
      setContent(enhancedContent);

      // Save to version history
      saveToVersionHistory("After AI enhancement");
    } catch (error) {
      console.error("Error enhancing text:", error);
      alert("Failed to enhance text. Please try again.");
    } finally {
      setIsEnhancing(false);
      setIsProcessing(false);
    }
  };

  const applyVersion = (versionContent: string) => {
    saveToVersionHistory("Before reverting to previous version");
    setContent(versionContent);
  };

  const compareWithCurrentVersion = (
    versionContent: string,
    description: string
  ) => {
    setCompareVersions({
      before: versionContent,
      after: content,
      description,
    });
    setShowVersionCompare(true);
  };

  const [showModelSelector, setShowModelSelector] = useState(false);

  // Add effect to reset the flag when the model changes
  useEffect(() => {
    // Reset the flag when AI model is changed
    setModelReturnedSameResult(false);
  }, [aiModel]);

  // Function to reset the failed models list
  const resetFailedModels = () => {
    setFailedModels(new Set());
    toast({
      title: "Failed models reset",
      description: "All models are now available for suggestions again.",
    });
  };

  // Function to expand selected text using AI
  const handleExpandSelection = async (
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    if (!selectedText.trim() || !aiEnabled) return;

    setIsProcessing(true);
    setSelectionProcessing(true);
    setSelectionAction("expanding");

    // Calculate the position for the indicator
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const textBeforeSelection = content.substring(0, selectionStart);
      const lines = textBeforeSelection.split("\n");
      const lineNumber = lines.length;

      // Rough approximation for position, adjust as needed
      const rect = textarea.getBoundingClientRect();
      const lineHeight = fontSize * lineSpacing;
      const top = rect.top + lineNumber * lineHeight;
      const left = rect.left + 100; // Position it a bit to the right

      setSelectionPosition({ top, left });
    }

    try {
      // Get the model to use
      if (!aiModel || !availableModels.includes(aiModel)) {
        setAiModel(availableModels[0]);
      }

      // Find friendly model name for toast
      const modelOption = modelOptions.find((m) => m.value === aiModel);
      const modelLabel = modelOption?.label || aiModel;

      toast({
        title: "Expanding selection",
        description: `Using ${modelLabel} to expand your selected text...`,
      });

      // Get context before and after the selection
      const contextBefore = content.substring(
        Math.max(0, selectionStart - 200),
        selectionStart
      );
      const contextAfter = content.substring(
        selectionEnd,
        Math.min(content.length, selectionEnd + 200)
      );

      // Send a request to expand the selected text with context
      const prompt = `I'll provide you with text that has a specific section that needs to be expanded. 
      
CONTEXT BEFORE SELECTED SECTION:
"""
${contextBefore}
"""

SELECTED SECTION TO EXPAND:
"""
${selectedText}
"""

CONTEXT AFTER SELECTED SECTION:
"""
${contextAfter}
"""

Please expand ONLY the SELECTED SECTION, adding more details, examples, or explanation. Keep your writing style, tone, and voice consistent with the surrounding context. The expanded content should flow naturally with the text before and after it. Focus on elaborating the ideas in the selected section without changing its original meaning.`;

      // Get expansion from AI
      const expandedText = await complete(prompt);

      if (expandedText && expandedText.trim()) {
        // Insert the expanded text at the selection position
        const newContent =
          content.substring(0, selectionStart) +
          expandedText +
          content.substring(selectionEnd);

        setContent(newContent);

        toast({
          title: "Text expanded",
          description: "AI has expanded your selected text.",
        });
      } else {
        toast({
          title: "Could not expand text",
          description:
            "The AI couldn't generate a meaningful expansion. Please try again or select different text.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error expanding text:", error);
      toast({
        title: "Error expanding text",
        description:
          "There was an error when trying to expand your text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectionProcessing(false);
    }
  };

  // Function to rewrite selected text using AI
  const handleRewriteSelection = async (
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    if (!selectedText.trim() || !aiEnabled) return;

    setIsProcessing(true);
    setSelectionProcessing(true);
    setSelectionAction("rewriting");

    // Calculate position for indicator
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const textBeforeSelection = content.substring(0, selectionStart);
      const lines = textBeforeSelection.split("\n");
      const lineNumber = lines.length;

      const rect = textarea.getBoundingClientRect();
      const lineHeight = fontSize * lineSpacing;
      const top = rect.top + lineNumber * lineHeight;
      const left = rect.left + 100;

      setSelectionPosition({ top, left });
    }

    try {
      // Check if we have a valid model
      if (!aiModel || !availableModels.includes(aiModel)) {
        setAiModel(availableModels[0]);
      }

      // Find friendly model name for toast
      const modelOption = modelOptions.find((m) => m.value === aiModel);
      const modelLabel = modelOption?.label || aiModel;

      toast({
        title: "Rewriting selection",
        description: `Using ${modelLabel} to rewrite your selected text...`,
      });

      // Get context before and after the selection
      const contextBefore = content.substring(
        Math.max(0, selectionStart - 200),
        selectionStart
      );
      const contextAfter = content.substring(
        selectionEnd,
        Math.min(content.length, selectionEnd + 200)
      );

      // Send a request to rewrite the selected text with context awareness
      const prompt = `I'll provide you with text that has a specific section that needs to be rewritten. 
      
CONTEXT BEFORE SELECTED SECTION:
"""
${contextBefore}
"""

SELECTED SECTION TO REWRITE:
"""
${selectedText}
"""

CONTEXT AFTER SELECTED SECTION:
"""
${contextAfter}
"""

Please rewrite ONLY the SELECTED SECTION in a different way, while keeping the same meaning. Your rewrite should:
1. Maintain the same tone, style, and level of formality as the surrounding context
2. Use different words and phrasing
3. Ensure the rewritten text flows naturally with the content before and after it
4. Keep the same key information and meaning as the original selected section

Provide only the rewritten text, without any explanations or notes.`;

      // Get rewrite from AI
      const rewrittenText = await complete(prompt);

      if (rewrittenText && rewrittenText.trim()) {
        // Replace the selected text with the rewritten version
        const newContent =
          content.substring(0, selectionStart) +
          rewrittenText +
          content.substring(selectionEnd);

        setContent(newContent);

        toast({
          title: "Text rewritten",
          description: "AI has rewritten your selected text.",
        });
      } else {
        toast({
          title: "Could not rewrite text",
          description:
            "The AI couldn't generate a good rewrite. Please try again or select different text.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rewriting text:", error);
      toast({
        title: "Error rewriting text",
        description:
          "There was an error when trying to rewrite your text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectionProcessing(false);
    }
  };

  // Function to improve selected text's writing quality
  const handleImproveSelection = async (
    selectedText: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    if (!selectedText.trim() || !aiEnabled) return;

    setIsProcessing(true);
    setSelectionProcessing(true);
    setSelectionAction("improving");

    // Calculate position for indicator
    const textarea = document.querySelector("textarea");
    if (textarea) {
      const textBeforeSelection = content.substring(0, selectionStart);
      const lines = textBeforeSelection.split("\n");
      const lineNumber = lines.length;

      const rect = textarea.getBoundingClientRect();
      const lineHeight = fontSize * lineSpacing;
      const top = rect.top + lineNumber * lineHeight;
      const left = rect.left + 100;

      setSelectionPosition({ top, left });
    }

    try {
      // Check if we have a valid model
      if (!aiModel || !availableModels.includes(aiModel)) {
        setAiModel(availableModels[0]);
      }

      // Find friendly model name for toast
      const modelOption = modelOptions.find((m) => m.value === aiModel);
      const modelLabel = modelOption?.label || aiModel;

      toast({
        title: "Improving writing",
        description: `Using ${modelLabel} to improve your selected text...`,
      });

      // Get context before and after the selection
      const contextBefore = content.substring(
        Math.max(0, selectionStart - 200),
        selectionStart
      );
      const contextAfter = content.substring(
        selectionEnd,
        Math.min(content.length, selectionEnd + 200)
      );

      // Send a request to improve the selected text with context awareness
      const prompt = `I'll provide you with text that has a specific section that needs to be improved. 
      
CONTEXT BEFORE SELECTED SECTION:
"""
${contextBefore}
"""

SELECTED SECTION TO IMPROVE:
"""
${selectedText}
"""

CONTEXT AFTER SELECTED SECTION:
"""
${contextAfter}
"""

Please improve ONLY the SELECTED SECTION by enhancing its clarity, flow, and overall quality. Your improved version should:
1. Fix any grammar, spelling, or punctuation issues
2. Improve clarity and readability
3. Enhance the flow and style while keeping the original meaning
4. Match the tone and voice of the surrounding context
5. Ensure the improved text transitions smoothly with the content before and after it

Provide only the improved text, without any explanations or notes.`;

      // Get improved text from AI
      const improvedText = await complete(prompt);

      if (improvedText && improvedText.trim()) {
        // Replace the selected text with the improved version
        const newContent =
          content.substring(0, selectionStart) +
          improvedText +
          content.substring(selectionEnd);

        setContent(newContent);

        toast({
          title: "Writing improved",
          description: "AI has improved your selected text.",
        });
      } else {
        toast({
          title: "Could not improve text",
          description:
            "The AI couldn't generate improvements. Please try again or select different text.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error improving text:", error);
      toast({
        title: "Error improving text",
        description:
          "There was an error when trying to improve your text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setSelectionProcessing(false);
    }
  };

  // Listen for custom events to clear suggestions
  useEffect(() => {
    const handleClearSuggestion = () => {
      if (suggestion) {
        setSuggestion("");
      }
    };

    document.addEventListener("clearSuggestion", handleClearSuggestion);

    return () => {
      document.removeEventListener("clearSuggestion", handleClearSuggestion);
    };
  }, [suggestion]);

  return (
    <div className="flex flex-col h-screen w-full max-w-full overflow-hidden">
      {/* Top toolbar with added document functions */}
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
        isEnhancing={isEnhancing}
        applyVersion={applyVersion}
        compareWithCurrentVersion={compareWithCurrentVersion}
        handleEnhanceText={handleEnhanceText}
        aiEnabled={aiEnabled}
        setAiEnabled={setAiEnabled}
        documentTitle={documentTitle}
        setDocumentTitle={setDocumentTitle}
        savedDocuments={savedDocuments}
        loadDocument={loadDocument}
        createNewDocument={createNewDocument}
        deleteDocument={deleteDocument}
        currentDocumentId={documentId}
        onSaveDocument={saveDocument}
        onLoadDocument={loadDocument}
        onCreateDocument={createNewDocument}
        onDeleteDocument={deleteDocument}
        aiModel={aiModel}
        setAiModel={(newModel) => {
          // Validate model before setting
          if (newModel && availableModels.includes(newModel)) {
            setAiModel(newModel);
            setCurrentModel(newModel);
            setModelReturnedSameResult(false); // Reset flag when user manually changes model
            // Reset failed models when user manually changes model
            setFailedModels(new Set());
          } else {
            console.warn(`Attempted to set invalid model: "${newModel}"`);
            toast({
              title: "Invalid model selected",
              description: `"${newModel}" is not available. Using default model instead.`,
              variant: "destructive",
            });
            setAiModel(availableModels[0]);
          }
        }}
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
            handleCursorChange={handleCursorChange}
            isEnhancing={isEnhancing}
            applyVersion={applyVersion}
            compareWithCurrentVersion={compareWithCurrentVersion}
            aiEnabled={aiEnabled}
            onExpandSelection={handleExpandSelection}
            onRewriteSelection={handleRewriteSelection}
            onImproveSelection={handleImproveSelection}
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
      {suggestion && aiEnabled && (
        <SuggestionFeedback
          suggestion={suggestion}
          setSuggestion={setSuggestion}
          acceptSuggestion={acceptSuggestion}
        />
      )}

      {/* Command palette */}
      {showCommandPalette && (
        <CommandPalette
          onClose={() => setShowCommandPalette(false)}
          onCommand={handleCommand}
        />
      )}

      {/* Inline AI processing indicator */}
      {selectionProcessing && (
        <InlineAIIndicator
          position={selectionPosition}
          action={selectionAction}
        />
      )}
    </div>
  );
}
