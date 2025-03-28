import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Thermometer, LineChart } from "lucide-react";

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
}: EditorSettingsProps) {
  return (
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
                <span className="text-sm">Font Size: {fontSize}px</span>
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
                Lower values create more deterministic suggestions, higher
                values increase creativity
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
              <Label htmlFor="bg-lines" className="text-sm flex items-center">
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
  );
}
