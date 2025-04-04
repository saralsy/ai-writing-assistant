import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";

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
  return (
    <Tabs defaultValue="appearance">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="editor">Editor</TabsTrigger>
        <TabsTrigger value="ai">AI</TabsTrigger>
      </TabsList>

      <TabsContent value="appearance" className="space-y-4">
        <div className="space-y-4">
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
                  onValueChange={(value) => setLineSpacingBackground(value[0])}
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
        </div>
      </TabsContent>

      <TabsContent value="editor" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Font</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="georgia">Georgia</SelectItem>
                <SelectItem value="courier">Courier</SelectItem>
                <SelectItem value="helvetica">Helvetica</SelectItem>
                <SelectItem value="times">Times New Roman</SelectItem>
                <SelectItem value="system-ui">System UI</SelectItem>
              </SelectContent>
            </Select>
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
        </div>
      </TabsContent>

      <TabsContent value="ai" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select value={aiModel} onValueChange={setAiModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="claude-3-haiku">
                  Claude 3 Haiku (Fast)
                </SelectItem>
                <SelectItem value="claude-3-sonnet">
                  Claude 3 Sonnet (Balanced)
                </SelectItem>
                <SelectItem value="claude-3-opus">
                  Claude 3 Opus (Powerful)
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the AI model that will generate writing suggestions.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Temperature ({temperature.toFixed(1)})</Label>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Precise</span>
                <Slider
                  min={0.1}
                  max={1.0}
                  step={0.1}
                  value={[temperature]}
                  onValueChange={(value) => setTemperature(value[0])}
                  className="w-24 mx-2"
                />
                <span>Creative</span>
              </div>
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
                <Sparkles className="h-3 w-3 mr-2" />
                Academic
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCustomInstructions(
                    "Write in a creative, engaging style with vivid descriptions."
                  )
                }
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Creative
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCustomInstructions(
                    "Write in a clear, concise business style."
                  )
                }
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Business
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCustomInstructions(
                    "Use simple language that's easy to understand."
                  )
                }
              >
                <Sparkles className="h-3 w-3 mr-2" />
                Simple
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
