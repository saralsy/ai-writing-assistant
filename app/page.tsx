import type { Metadata } from "next"
import WritingEditor from "@/components/writing-editor"

export const metadata: Metadata = {
  title: "AI Writing Assistant",
  description: "Intelligent writing assistant with AI-powered suggestions",
}

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <WritingEditor />
    </main>
  )
}

