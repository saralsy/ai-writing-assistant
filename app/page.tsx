"use client";
import { useState } from "react";
import WritingEditor from "@/components/writing-editor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { DraftSidebar } from "@/components/app-sidebar";
import { Draft } from "@/lib/types";

export default function HomePage() {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex overflow-hidden w-full">
        <DraftSidebar
          selectedDraft={selectedDraft}
          setSelectedDraft={setSelectedDraft}
        />
        <SidebarInset className="flex-1 overflow-hidden p-0 w-full max-w-full">
          <WritingEditor />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
