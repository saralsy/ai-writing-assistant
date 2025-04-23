"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { ChevronDown, Sparkles, RefreshCw, Wand2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

interface TextSelectionToolbarProps {
  onExpand: (selectedText: string) => void;
  onRewrite: (selectedText: string) => void;
  onImprove: (selectedText: string) => void;
  editorRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function TextSelectionToolbar({
  onExpand,
  onRewrite,
  onImprove,
  editorRef,
}: TextSelectionToolbarProps) {
  const [selectedText, setSelectedText] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log("TextSelectionToolbar mounted");
    console.log("Editor ref provided:", !!editorRef?.current);
    return () => {
      console.log("TextSelectionToolbar unmounted");
    };
  }, [editorRef]);

  // Debug logging for visibility
  useEffect(() => {
    console.log("Toolbar visibility changed:", visible);
  }, [visible]);

  // Check textarea selection directly
  const checkTextareaSelection = () => {
    if (editorRef?.current) {
      const textarea = editorRef.current;
      const { selectionStart, selectionEnd } = textarea;

      console.log("Direct textarea selection check:", {
        selectionStart,
        selectionEnd,
      });

      if (selectionStart !== selectionEnd) {
        // There is selected text in the textarea
        const selectedValue = textarea.value.substring(
          selectionStart,
          selectionEnd
        );
        console.log("Textarea selection text:", selectedValue);

        if (selectedValue.trim().length > 0) {
          setSelectedText(selectedValue);

          // Calculate position relative to the textarea
          const textareaRect = textarea.getBoundingClientRect();

          // Get text before the selection to count lines and approximate character position
          const textBefore = textarea.value.substring(0, selectionStart);
          const linesBefore = textBefore.split("\n").length;

          // Get the current line's text to approximately calculate horizontal position
          const lines = textarea.value.substring(0, selectionEnd).split("\n");
          const currentLine = lines[lines.length - 1];
          const lastNewlinePos = textBefore.lastIndexOf("\n");
          const posInLine =
            lastNewlinePos === -1
              ? selectionStart
              : selectionStart - lastNewlinePos - 1;

          // Calculate the selection width for horizontal positioning
          const selectionWidth = Math.min(200, selectedValue.length * 8); // Approximate character width

          // Calculate padding and styles
          const computedStyle = window.getComputedStyle(textarea);
          const paddingTop = parseFloat(computedStyle.paddingTop) || 0;
          const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
          const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
          const fontSize = parseFloat(computedStyle.fontSize) || 16;

          // Adjust for scroll position
          const scrollTop = textarea.scrollTop;
          const scrollLeft = textarea.scrollLeft;

          // Calculate the estimated position of the selection
          const estimatedTop =
            textareaRect.top +
            paddingTop +
            linesBefore * lineHeight -
            scrollTop;

          // Calculate horizontal position based on characters in line
          // This is approximate as monospace fonts would be more accurate than variable-width fonts
          const charWidth = fontSize * 0.6; // Approximate character width
          const estimatedLeft =
            textareaRect.left +
            paddingLeft +
            posInLine * charWidth -
            scrollLeft +
            selectionWidth / 2;

          // Create position for the toolbar - position it above the selection
          const newPosition = {
            top: estimatedTop - 40, // Position above the selection with some margin
            left: Math.min(
              Math.max(estimatedLeft, textareaRect.left + 100),
              textareaRect.right - 100
            ), // Keep within textarea bounds
          };

          console.log("Calculated toolbar position:", {
            newPosition,
            textareaRect,
            linesBefore,
            posInLine,
            selectionWidth,
            estimatedTop,
            estimatedLeft,
          });

          setPosition(newPosition);
          setVisible(true);
          return true;
        }
      }
    }
    return false;
  };

  // Handle selection change
  useEffect(() => {
    // Function to check if selection is inside the editor
    const isSelectionInEditor = (selection: Selection | null): boolean => {
      if (!selection || selection.rangeCount === 0) return false;

      // If editor ref is provided, check if selection is within editor
      if (editorRef?.current) {
        const range = selection.getRangeAt(0);
        const editorElement = editorRef.current;
        console.log("Checking if selection is in editor");

        // Try to determine if selection is inside the editor
        try {
          // First check if the selection's anchor node is within the editor
          let container = range.commonAncestorContainer;
          // If the container is a text node, get its parent
          if (container.nodeType === Node.TEXT_NODE) {
            container = container.parentNode!;
          }

          const result =
            editorElement === container ||
            editorElement.contains(container as Node);
          console.log("Selection in editor check result:", result);
          return result;
        } catch (error) {
          console.error("Error checking if selection is in editor:", error);
          // Fallback to checking if there's any text selected
          return selection.toString().trim().length > 0;
        }
      }

      console.log("No editor ref provided, using document-wide selection");
      // If no editor ref, check if selection has text
      return !!selection && !selection.isCollapsed;
    };

    const handleSelectionChange = () => {
      console.log("handleSelectionChange triggered");

      // First try to get selection directly from textarea if available
      if (checkTextareaSelection()) {
        console.log("Selection detected from textarea directly");
        return;
      }

      // Fall back to window selection method
      const selection = window.getSelection();
      console.log("Window selection change detected", {
        selection: selection?.toString(),
        isCollapsed: selection?.isCollapsed,
        rangeCount: selection?.rangeCount,
      });

      if (
        selection &&
        !selection.isCollapsed &&
        selection.toString().trim().length > 0 &&
        isSelectionInEditor(selection)
      ) {
        // Get selected text
        const text = selection.toString().trim();
        setSelectedText(text);
        console.log("Selected text:", text);

        // Get position for the toolbar
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          console.log("Selection rect:", rect);

          // Position the toolbar above the selection
          const newPosition = {
            top: rect.top - 10 - (toolbarRef.current?.offsetHeight || 0),
            left: rect.left + rect.width / 2,
          };
          console.log("Setting toolbar position:", newPosition);
          setPosition(newPosition);

          setVisible(true);
        } catch (error) {
          console.error("Error getting selection position:", error);
        }
      } else {
        // Only hide toolbar if no selection is detected at all
        if (
          visible &&
          (!selection ||
            selection.isCollapsed ||
            selection.toString().trim().length === 0)
        ) {
          console.log(
            "Hiding toolbar due to no selection or selection outside editor"
          );
          setVisible(false);
        }
      }
    };

    console.log("Setting up selection event listeners");
    // Listen for selection changes
    document.addEventListener("selectionchange", handleSelectionChange);

    // We specifically want mouseup on the editor element if editorRef is provided
    const mouseupTarget = editorRef?.current || document;
    mouseupTarget.addEventListener("mouseup", handleSelectionChange);

    // Initial check
    setTimeout(handleSelectionChange, 100);

    return () => {
      console.log("Removing selection event listeners");
      document.removeEventListener("selectionchange", handleSelectionChange);
      mouseupTarget.removeEventListener("mouseup", handleSelectionChange);
    };
  }, [editorRef, selectedText]);

  // Hide toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        console.log("Click outside detected, hiding toolbar");
        setVisible(false);
      }
    };

    console.log("Setting up click outside listener");
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      console.log("Removing click outside listener");
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  console.log("Rendering TextSelectionToolbar, visible:", visible);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={toolbarRef}
          className="fixed z-[100] bg-background/90 backdrop-blur-sm border rounded-full shadow-lg flex items-center p-1 transform -translate-x-1/2"
          style={{
            top: `${Math.max(position.top, 10)}px`,
            left: `${position.left}px`,
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs h-8 rounded-full flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
            onClick={() => onExpand(selectedText)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Expand</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs h-8 rounded-full flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
            onClick={() => onRewrite(selectedText)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Rewrite</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="px-3 py-1 text-xs h-8 rounded-full flex items-center gap-1 hover:bg-primary hover:text-primary-foreground"
            onClick={() => onImprove(selectedText)}
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span>Improve</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
