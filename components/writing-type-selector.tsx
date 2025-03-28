"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  BookText,
  GraduationCap,
  FileText,
  Briefcase,
  Pencil,
  Settings,
} from "lucide-react";

export interface WritingType {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  instructions: string;
}

export const WRITING_TYPES: WritingType[] = [
  {
    id: "general",
    name: "General",
    icon: Pencil,
    description: "General purpose writing with balanced tone and style",
    instructions:
      "Provide balanced, neutral suggestions that maintain the user's style and tone.",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Professional email communication",
    instructions:
      "Suggest concise, clear, and professional language appropriate for email communication. Focus on clarity and directness while maintaining appropriate formality.",
  },
  {
    id: "journal",
    name: "Journal",
    icon: BookText,
    description: "Personal journal or diary entries",
    instructions:
      "Offer reflective, introspective suggestions that maintain a personal and authentic voice. Emphasize emotional expression and self-reflection.",
  },
  {
    id: "academic",
    name: "Academic",
    icon: GraduationCap,
    description: "Scholarly writing for academic purposes",
    instructions:
      "Provide formal, precise language with academic terminology. Focus on logical structure, evidence-based arguments, and proper citation style.",
  },
  {
    id: "business",
    name: "Business",
    icon: Briefcase,
    description: "Professional business documents",
    instructions:
      "Suggest clear, concise business language with appropriate terminology. Focus on actionable points, data-driven insights, and professional tone.",
  },
  {
    id: "creative",
    name: "Creative",
    icon: FileText,
    description: "Creative writing and storytelling",
    instructions:
      "Offer imaginative, vivid language that enhances narrative elements. Focus on descriptive details, character development, and engaging storytelling.",
  },
  {
    id: "custom",
    name: "Custom",
    icon: Settings,
    description: "Custom writing style with your own instructions",
    instructions: "",
  },
];

interface WritingTypeSelectorProps {
  selectedType: string;
  customInstructions: string;
  onTypeChange: (typeId: string) => void;
  onCustomInstructionsChange: (instructions: string) => void;
}

export default function WritingTypeSelector({
  selectedType,
  customInstructions,
  onTypeChange,
  onCustomInstructionsChange,
}: WritingTypeSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempInstructions, setTempInstructions] = useState(customInstructions);

  const selectedWritingType =
    WRITING_TYPES.find((type) => type.id === selectedType) || WRITING_TYPES[0];
  const Icon = selectedWritingType.icon;

  const handleSaveInstructions = () => {
    onCustomInstructionsChange(tempInstructions);
    setIsDialogOpen(false);
  };

  const handleTypeChange = (value: string) => {
    onTypeChange(value);

    // If switching to custom, open the dialog
    if (value === "custom") {
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {/* <Icon className="h-4 w-4 text-muted-foreground mr-1" /> */}
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[140px] h-8">
            <SelectValue placeholder="Writing type" />
          </SelectTrigger>
          <SelectContent>
            {WRITING_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                <div className="flex items-center gap-2">
                  <type.icon className="h-4 w-4 mr-1" />
                  <span>{type.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedType === "custom" && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Settings className="h-3.5 w-3.5 mr-1" />
              Custom Settings
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Custom Writing Instructions</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">
                  Instructions for AI suggestions
                </Label>
                <Textarea
                  id="instructions"
                  placeholder="Provide detailed instructions for how the AI should generate suggestions..."
                  value={tempInstructions}
                  onChange={(e) => setTempInstructions(e.target.value)}
                  className="min-h-[150px]"
                />
                <p className="text-sm text-muted-foreground">
                  These instructions will guide how AI suggestions are
                  generated. Be specific about tone, style, terminology, and any
                  other aspects you want the AI to consider.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveInstructions}>
                Save Instructions
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
