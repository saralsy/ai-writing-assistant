import { FileText } from "lucide-react"

interface DocumentOutlineProps {
  content: string
}

export default function DocumentOutline({ content }: DocumentOutlineProps) {
  // Extract headings from content (this is a simple implementation)
  // In a real app, you'd want to parse Markdown properly
  const extractHeadings = (text: string) => {
    const lines = text.split("\n")
    const headings: { level: number; text: string }[] = []

    lines.forEach((line) => {
      // Check for markdown headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        headings.push({
          level: headingMatch[1].length,
          text: headingMatch[2],
        })
      }
    })

    // If no headings found, create sections based on paragraphs
    if (headings.length === 0) {
      const paragraphs = text.split("\n\n")
      paragraphs.forEach((para, index) => {
        if (para.trim() && index < 5) {
          // Limit to first 5 paragraphs
          const words = para.split(" ")
          const title = words.slice(0, 3).join(" ") + (words.length > 3 ? "..." : "")
          headings.push({
            level: 2,
            text: title,
          })
        }
      })
    }

    return headings
  }

  const headings = extractHeadings(content)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Document Outline</h3>
      </div>

      {headings.length > 0 ? (
        <div className="space-y-1">
          {headings.map((heading, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-1.5 rounded-md hover:bg-accent cursor-pointer"
              style={{ paddingLeft: `${(heading.level - 1) * 12 + 6}px` }}
            >
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm truncate">{heading.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          {content
            ? "No headings found. Add # Heading to create structure."
            : "Your document outline will appear here."}
        </div>
      )}

      {content && (
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Words</span>
              <span>{content.split(/\s+/).filter(Boolean).length}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Characters</span>
              <span>{content.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

