import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, ChevronDown } from "lucide-react";
import { modelOptions } from "@/lib/model-options";

interface EditorSettingsProps {
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
  aiModel: string;
  setAiModel: (model: string) => void;
  customInstructions: string;
  setCustomInstructions: (instructions: string) => void;
}

export default function EditorSettings({
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
  aiModel,
  setAiModel,
  customInstructions,
  setCustomInstructions,
}: EditorSettingsProps) {
  // Helper to get a readable font name from the font value
  const getFontDisplayName = (fontValue: string) => {
    switch (fontValue) {
      case "inter":
        return "Inter";
      case "georgia":
        return "Georgia";
      case "courier":
        return "Courier";
      case "helvetica":
        return "Helvetica";
      case "times":
        return "Times New Roman";
      case "system-ui":
        return "System UI";
      default:
        return fontValue;
    }
  };

  // Helper to get a readable model name from the model value
  const getModelDisplayName = (modelValue: string) => {
    const model = modelOptions.find((option) => option.value === modelValue);
    return model ? model.label : modelOptions[1].label; // Default to Claude 3 Sonnet if not found
  };

  return (
    <Tabs defaultValue="appearance">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="ai">AI</TabsTrigger>
      </TabsList>

      <TabsContent value="appearance">
        <Card>
          <CardContent className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-8 p-1"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Show Background Lines</Label>
                <Switch
                  checked={showBackgroundLines}
                  onCheckedChange={setShowBackgroundLines}
                />
              </div>
            </div>

            {showBackgroundLines && (
              <>
                <div className="space-y-2">
                  <Label>Line Spacing ({lineSpacing_background}px)</Label>
                  <Slider
                    min={16}
                    max={48}
                    step={1}
                    value={[lineSpacing_background]}
                    onValueChange={(value) =>
                      setLineSpacingBackground(value[0])
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Line Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      type="text"
                      value={lineColor}
                      onChange={(e) => setLineColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="editor">
        <Card>
          <CardContent className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label>Font</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getFontDisplayName(font)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full" align="start">
                  <DropdownMenuLabel>Select Font</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFont("inter")}>
                    Inter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFont("georgia")}>
                    Georgia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFont("courier")}>
                    Courier
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFont("helvetica")}>
                    Helvetica
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFont("times")}>
                    Times New Roman
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFont("system-ui")}>
                    System UI
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label>Font Size ({fontSize}px)</Label>
              <Slider
                min={12}
                max={24}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Line Spacing ({lineSpacing.toFixed(1)})</Label>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={[lineSpacing]}
                onValueChange={(value) => setLineSpacing(value[0])}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ai">
        <Card>
          <CardContent className="space-y-6 mt-3">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {getModelDisplayName(aiModel)}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-full max-h-[300px] overflow-y-auto"
                  align="start"
                >
                  <DropdownMenuLabel>Select AI Model</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {modelOptions.map((model) => (
                    <DropdownMenuItem
                      key={model.value}
                      onClick={() => setAiModel(model.value)}
                    >
                      {model.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <p className="text-xs text-muted-foreground">
                Select the AI model that will generate writing suggestions.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Temperature ({temperature.toFixed(1)})</Label>
              <Slider
                min={0.1}
                max={1.0}
                step={0.1}
                value={[temperature]}
                onValueChange={(value) => setTemperature(value[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Lower values produce more predictable text, higher values more
                creative.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Custom Instructions</Label>
              <Textarea
                placeholder="Add specific instructions for the AI (e.g., 'Write in a formal tone' or 'Use simple language')"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                These instructions will guide how the AI generates suggestions.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Instruction Presets</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomInstructions(
                      "Write in a formal academic tone with precise language."
                    )
                  }
                >
                  Academic
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomInstructions(
                      "Use a conversational, friendly tone as if writing to a friend."
                    )
                  }
                >
                  Casual
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomInstructions(
                      "Write clear, concise content optimized for business communication."
                    )
                  }
                >
                  Business
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCustomInstructions(
                      "Create engaging, creative content that captivates readers."
                    )
                  }
                >
                  Creative
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
