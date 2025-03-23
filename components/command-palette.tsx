"use client"

import { useState, useEffect, useRef } from "react"
import { Command, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandPaletteProps {
  onClose: () => void
  onCommand: (command: string) => void
}

const COMMANDS = [
  { id: "rewrite", label: "Rewrite", description: "Rewrite the selected text" },
  { id: "expand", label: "Expand", description: "Expand on the current idea" },
  { id: "summarize", label: "Summarize", description: "Summarize the document" },
  { id: "improve", label: "Improve", description: "Improve writing style" },
  { id: "shorten", label: "Shorten", description: "Make the text more concise" },
  { id: "grammar", label: "Fix Grammar", description: "Correct grammar issues" },
]

export default function CommandPalette({ onClose, onCommand }: CommandPaletteProps) {
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCommands = COMMANDS.filter(
    (command) =>
      command.label.toLowerCase().includes(search.toLowerCase()) ||
      command.description.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    // Focus input when component mounts
    inputRef.current?.focus()

    // Reset selected index when filtered results change
    setSelectedIndex(0)

    // Handle click outside to close
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest(".command-palette")) {
        onClose()
      }
    }

    // Handle escape key to close
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : prev))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev))
      } else if (e.key === "Enter") {
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          onCommand(filteredCommands[selectedIndex].id)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [filteredCommands, selectedIndex, onClose, onCommand])

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start justify-center pt-24">
      <div className="command-palette w-full max-w-md bg-background border rounded-lg shadow-lg overflow-hidden">
        <div className="p-3 border-b flex items-center gap-2">
          <Command className="h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none"
          />
        </div>

        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            <div className="py-2">
              {filteredCommands.map((command, index) => (
                <div
                  key={command.id}
                  className={cn(
                    "px-3 py-2 flex items-center gap-3 cursor-pointer",
                    selectedIndex === index ? "bg-accent" : "hover:bg-accent/50",
                  )}
                  onClick={() => onCommand(command.id)}
                >
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{command.label}</div>
                    <div className="text-sm text-muted-foreground">{command.description}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">No commands found</div>
          )}
        </div>
      </div>
    </div>
  )
}

