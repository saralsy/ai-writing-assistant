import { Button } from "@/components/ui/button";
import {
  FileText,
  Split,
  Command,
  Settings,
  Wand2,
  Sparkles,
  EyeOff,
  FileIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import AIStatusIndicator from "./ai-status-indicator";
import WritingTypeSelector from "./writing-type-selector";
import EditorSettings from "./editor-settings";
import { useState, useRef } from "react";

interface EditorToolbarProps {
  savedStatus: string;
  isProcessing: boolean;
  writingType: string;
  customInstructions: string;
  showOutline: boolean;
  splitScreen: boolean;
  setWritingType: (type: string) => void;
  setCustomInstructions: (instructions: string) => void;
  setShowOutline: (show: boolean) => void;
  setSplitScreen: (split: boolean) => void;
  setShowCommandPalette: (show: boolean) => void;
  // Settings props
  font: string;
  setFont: (font: string) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  lineSpacing: number;
  setLineSpacing: (spacing: number) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  showBackgroundLines: boolean;
  setShowBackgroundLines: (show: boolean) => void;
  lineSpacing_background: number;
  setLineSpacingBackground: (spacing: number) => void;
  lineColor: string;
  setLineColor: (color: string) => void;
  isEnhancing: boolean;
  applyVersion: (versionContent: string) => void;
  compareWithCurrentVersion: (
    versionContent: string,
    description: string
  ) => void;
  handleEnhanceText: () => void;
  aiEnabled: boolean;
  setAiEnabled: (enabled: boolean) => void;
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  savedDocuments: SavedDocument[];
  loadDocument: (id: string) => void;
  createNewDocument: () => void;
  deleteDocument: (id: string) => void;
  currentDocumentId: string;
  onSaveDocument: (doc: SavedDocument) => void;
  onLoadDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  aiModel: string;
  setAiModel: (model: string) => void;
}

interface SavedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export default function EditorToolbar({
  savedStatus,
  isProcessing,
  writingType,
  customInstructions,
  showOutline,
  splitScreen,
  setWritingType,
  setCustomInstructions,
  setShowOutline,
  setSplitScreen,
  setShowCommandPalette,
  // Settings props
  font,
  setFont,
  fontSize,
  setFontSize,
  lineSpacing,
  setLineSpacing,
  temperature,
  setTemperature,
  backgroundColor,
  setBackgroundColor,
  showBackgroundLines,
  setShowBackgroundLines,
  lineSpacing_background,
  setLineSpacingBackground,
  lineColor,
  setLineColor,
  isEnhancing,
  applyVersion,
  compareWithCurrentVersion,
  handleEnhanceText,
  aiEnabled,
  setAiEnabled,
  documentTitle,
  setDocumentTitle,
  savedDocuments,
  loadDocument,
  createNewDocument,
  deleteDocument,
  currentDocumentId,
  onSaveDocument,
  onLoadDocument,
  onCreateDocument,
  onDeleteDocument,
  aiModel,
  setAiModel,
}: EditorToolbarProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    // Focus the input after rendering
    setTimeout(() => titleInputRef.current?.focus(), 0);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setIsEditingTitle(false);
    }
  };

  return (
    <div className="border-b p-2 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <FileText className="h-5 w-5 text-muted-foreground" />

        {isEditingTitle ? (
          <input
            ref={titleInputRef}
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="text-sm font-medium bg-transparent border-b border-primary outline-none w-40"
            autoFocus
          />
        ) : (
          <span
            className="text-sm font-medium cursor-pointer hover:text-primary"
            onClick={handleTitleClick}
          >
            {documentTitle || "Untitled Document"}
          </span>
        )}

        <span className="text-xs text-muted-foreground ml-2">
          {savedStatus}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <AIStatusIndicator
          isProcessing={isProcessing}
          aiEnabled={aiEnabled}
          setAiEnabled={setAiEnabled}
          aiModel={aiModel}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isEnhancing}
                onClick={handleEnhanceText}
                className={cn(isEnhancing && "animate-pulse")}
              >
                <Wand2
                  className={cn(
                    "h-4 w-4",
                    isEnhancing && "animate-spin text-primary"
                  )}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Enhance writing with AI</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAiEnabled(!aiEnabled)}
              >
                {aiEnabled ? (
                  <Sparkles className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {aiEnabled ? "Disable AI suggestions" : "Enable AI suggestions"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <WritingTypeSelector
          selectedType={writingType}
          customInstructions={customInstructions}
          onTypeChange={setWritingType}
          onCustomInstructionsChange={setCustomInstructions}
        />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Toggle document outline</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Toggle split screen mode</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
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
            </TooltipTrigger>
            <TooltipContent>Open command palette</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <FileIcon className="h-4 w-4 mr-2" />
              Documents
              <ChevronDownIcon className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={onCreateDocument}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Document
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {savedDocuments && savedDocuments.length > 0 ? (
              savedDocuments.map((doc) => (
                <DropdownMenuItem
                  key={doc.id}
                  className={`flex justify-between items-center ${
                    doc.id === currentDocumentId ? "bg-muted" : ""
                  }`}
                >
                  <div
                    className="flex-1 truncate cursor-pointer"
                    onClick={() => onLoadDocument(doc.id)}
                  >
                    {doc.title || "Untitled"}
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(doc.lastModified).toLocaleDateString()}
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (
                              confirm(
                                "Are you sure you want to delete this document?"
                              )
                            ) {
                              onDeleteDocument(doc.id);
                            }
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        Delete document
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No saved documents</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

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
            <EditorSettings
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
              aiModel={aiModel}
              setAiModel={setAiModel}
              customInstructions={customInstructions}
              setCustomInstructions={setCustomInstructions}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
