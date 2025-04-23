"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Sparkles, RefreshCw, Wand2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// -----------------------------------------------------------------------------
// COMPONENT INTERFACE
// -----------------------------------------------------------------------------

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

  // -----------------------------------------------------------------------------
  // POSITIONING UTILITIES
  // -----------------------------------------------------------------------------

  /**
   * Ensures the toolbar position stays within the viewport boundaries
   * Adjusts position to avoid clipping at screen edges
   */
  const ensurePositionInViewport = (position: {
    top: number;
    left: number;
  }) => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get toolbar dimensions when available or estimate them
    let toolbarWidth = 250; // Default estimate
    let toolbarHeight = 50; // Default estimate

    if (toolbarRef.current) {
      const rect = toolbarRef.current.getBoundingClientRect();
      toolbarWidth = rect.width;
      toolbarHeight = rect.height;
    } else {
      // Estimate based on button count if toolbar not yet rendered
      toolbarWidth = 3 * 80 + 20; // 3 buttons + padding
    }

    console.log("Toolbar dimensions:", {
      toolbarWidth,
      toolbarHeight,
      viewportWidth,
      viewportHeight,
      requestedPosition: position,
    });

    // Calculate new position to ensure it stays within viewport
    const newPosition = { ...position };

    // Ensure top is within viewport (with 10px margin)
    newPosition.top = Math.max(
      10,
      Math.min(newPosition.top, viewportHeight - toolbarHeight - 10)
    );

    // Define safe boundaries for left position, considering toolbar is centered (-translate-x-1/2)
    const minLeft = toolbarWidth / 2 + 10;
    const maxLeft = viewportWidth - toolbarWidth / 2 - 10;

    // Ensure left is within bounds
    if (position.left < minLeft) {
      newPosition.left = minLeft;
      console.log("Adjusting toolbar position - too close to left edge");
    } else if (position.left > maxLeft) {
      newPosition.left = maxLeft;
      console.log("Adjusting toolbar position - too close to right edge", {
        originalLeft: position.left,
        adjustedLeft: maxLeft,
        viewportWidth,
        toolbarWidth,
      });
    }

    console.log("Final toolbar position:", newPosition);
    return newPosition;
  };

  /**
   * Calculate position using the Selection API for more accuracy
   * Uses a hidden measurement div to precisely determine selection coordinates
   */
  const calculatePosition = () => {
    if (!editorRef?.current) return { top: 0, left: 0 };

    const textarea = editorRef.current;
    const { selectionStart, selectionEnd } = textarea;

    if (selectionStart === selectionEnd) return { top: 0, left: 0 };

    // Create a range from the textarea content to measure the selection position
    const text = textarea.value;
    const textBeforeSelection = text.substring(0, selectionStart);

    // Create a hidden div with the same styling as the textarea
    const measureDiv = document.createElement("div");
    const styles = window.getComputedStyle(textarea);

    // Copy relevant styles
    measureDiv.style.font = styles.font;
    measureDiv.style.fontSize = styles.fontSize;
    measureDiv.style.lineHeight = styles.lineHeight;
    measureDiv.style.whiteSpace = "pre-wrap";
    measureDiv.style.position = "absolute";
    measureDiv.style.top = "0";
    measureDiv.style.left = "0";
    measureDiv.style.visibility = "hidden";
    measureDiv.style.width = `${textarea.clientWidth}px`;
    measureDiv.style.padding = styles.padding;

    // Add text content with a marker span at the selection point
    measureDiv.innerHTML =
      textBeforeSelection.replace(/\n/g, "<br>") +
      '<span id="selection-marker"></span>';

    document.body.appendChild(measureDiv);

    // Get the position of the marker
    const marker = document.getElementById("selection-marker");
    const markerRect = marker?.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();

    // Clean up
    document.body.removeChild(measureDiv);

    if (!markerRect) return { top: 0, left: 0 };

    // Calculate position relative to the viewport, accounting for scroll
    const top =
      textareaRect.top +
      (markerRect.top - measureDiv.getBoundingClientRect().top) -
      40;
    const left =
      textareaRect.left +
      (markerRect.left - measureDiv.getBoundingClientRect().left);

    return {
      top: top - textarea.scrollTop,
      left: Math.min(
        Math.max(left, textareaRect.left + 100),
        textareaRect.right - 100
      ),
    };
  };

  /**
   * Calculates toolbar position for window selection
   * Uses range's bounding rect for positioning
   */
  const calculateWindowSelectionToolbarPosition = (selection: Selection) => {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Calculate appropriate starting position based on selection
    let initialLeft = rect.left + rect.width / 2;

    // Check if selection is too close to the right edge
    if (rect.right > window.innerWidth - 100) {
      // Adjust position if near right edge to ensure visibility
      console.log("Selection near right edge, adjusting position");
      initialLeft = Math.min(initialLeft, window.innerWidth - 150);
    }

    // Position the toolbar above the selection
    const initialPosition = {
      top: rect.top - 10 - (toolbarRef.current?.offsetHeight || 0),
      left: initialLeft,
    };

    console.log("Calculated window selection toolbar position:", {
      initialPosition,
      selectionRect: rect,
      viewportWidth: window.innerWidth,
    });

    return initialPosition;
  };

  // -----------------------------------------------------------------------------
  // SELECTION DETECTION
  // -----------------------------------------------------------------------------

  /**
   * Checks if the editor has selected text directly from the textarea
   * Returns true if selection was handled
   */
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

          // Use the new more accurate position calculation method
          const initialPosition = calculatePosition();
          console.log(
            "Calculated accurate textarea position:",
            initialPosition
          );

          // Ensure position is within viewport
          const newPosition = ensurePositionInViewport(initialPosition);
          setPosition(newPosition);
          setVisible(true);
          return true;
        }
      }
    }
    return false;
  };

  /**
   * Checks if the selection is inside the editor element
   */
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

  // -----------------------------------------------------------------------------
  // EVENT HANDLERS
  // -----------------------------------------------------------------------------

  /**
   * Main selection change handler
   * Checks for selection and positions toolbar accordingly
   */
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
        const initialPosition =
          calculateWindowSelectionToolbarPosition(selection);

        // Ensure position is within viewport
        const newPosition = ensurePositionInViewport(initialPosition);
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

  // -----------------------------------------------------------------------------
  // EFFECT HOOKS
  // -----------------------------------------------------------------------------

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

  // Set up selection change listeners
  useEffect(() => {
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

  // -----------------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------------

  console.log("Rendering TextSelectionToolbar, visible:", visible);

  return (
    <>
      {visible && selectedText && (
        <div
          ref={toolbarRef}
          className={`
            fixed transform -translate-x-1/2
            bg-black/80 backdrop-blur-sm
            text-white rounded-md shadow-lg
            flex items-center gap-1 px-2 py-1
            transition-all duration-200 ease-in-out
            border border-gray-800/50
            z-[1000]
          `}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onExpand(selectedText)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Expand with AI"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Expand with AI</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onRewrite(selectedText)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Rewrite"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rewrite selection</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onImprove(selectedText)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Improve"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Improve writing</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="h-4 w-[1px] bg-gray-400/30 mx-1"></div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setVisible(false)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Close toolbar</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </>
  );
}
