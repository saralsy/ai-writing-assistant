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
    } else {
      setContent("");
      setDocumentTitle("Untitled Document");
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
      const updatedDocs = savedDocuments.filter((doc) => doc.id !== id);
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
            isEnhancing={isEnhancing}
            applyVersion={applyVersion}
            compareWithCurrentVersion={compareWithCurrentVersion}
            aiEnabled={aiEnabled}
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
    </div>
  );
}
