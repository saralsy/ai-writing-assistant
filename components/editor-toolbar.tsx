import { Button } from "@/components/ui/button";
import { FileText, Split, Command, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import AIStatusIndicator from "./ai-status-indicator";
import WritingTypeSelector from "./writing-type-selector";
import EditorSettings from "./editor-settings";

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
}: EditorToolbarProps) {
  return (
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

        <WritingTypeSelector
          selectedType={writingType}
          customInstructions={customInstructions}
          onTypeChange={setWritingType}
          onCustomInstructionsChange={setCustomInstructions}
        />

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
          <span className="sr-only md:not-sr-only md:inline-block">Split</span>
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
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
