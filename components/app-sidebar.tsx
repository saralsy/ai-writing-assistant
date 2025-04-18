"use client";

import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarInput,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  FilePlus,
  FileText,
  Search,
  Trash2,
  Clock,
  PanelLeft,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllDrafts, deleteDraft, saveDraft } from "@/lib/storage";
import type { Draft } from "@/lib/types";
import { formatDistanceToNow } from "@/lib/utils";
import DocumentList from "./document-list";
import { AuthSidebar } from "./auth-sidebar";
import { useSession } from "next-auth/react";

interface SavedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}
interface DraftSidebarProps {
  selectedDraft: Draft | null;
  setSelectedDraft: (draft: Draft | null) => void;
  savedDocuments: SavedDocument[];
  currentDocumentId: string;
  onLoadDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  setSavedDocuments: (docs: SavedDocument[]) => void;
  setDocumentId: (id: string) => void;
}

export function DraftSidebar({
  selectedDraft,
  setSelectedDraft,
  savedDocuments = [],
  currentDocumentId = "",
  onLoadDocument = () => {},
  onCreateDocument = () => {},
  onDeleteDocument = () => {},
  setSavedDocuments = () => {},
  setDocumentId = () => {},
}: DraftSidebarProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "alphabetical"
  >("newest");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    loadDrafts();
  }, [session]);

  const loadDrafts = async () => {
    const allDrafts = await getAllDrafts();
    setDrafts(allDrafts);
  };

  const handleCreateNewDraft = () => {
    const newDraft: Draft = {
      id: crypto.randomUUID(),
      title: "Untitled Draft",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: session?.user?.email || null,
    };

    // Save the new draft to storage first
    saveDraft(newDraft);

    // Then update the UI
    loadDrafts();
    setSelectedDraft(newDraft);
  };

  const handleDeleteDraft = (id: string) => {
    deleteDraft(id);
    loadDrafts();
    if (selectedDraft?.id === id) {
      setSelectedDraft(null);
    }
  };

  const handleSelectDraft = (draft: Draft) => {
    setSelectedDraft(draft);
  };

  const filteredDrafts = drafts.filter(
    (draft) =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedDrafts = [...filteredDrafts].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Function to handle sidebar collapse state changes
  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  // CSS classes for elements that should be hidden when collapsed
  const hiddenWhenCollapsed = isCollapsed ? "hidden" : "";

  return (
    <Sidebar
      variant="inset"
      collapsible="offcanvas"
      className="border-r border-border/40"
    >
      <SidebarHeader>
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">Your Drafts</span>
          </div>
        </div>
        <div className="px-2 pb-2">
          <Button
            onClick={handleCreateNewDraft}
            className="w-full justify-start"
            variant="ghost"
          >
            <FilePlus className="h-4 w-4 mr-2" />
            New Draft
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Authentication Section */}
        <AuthSidebar />

        <div className="flex-1 overflow-hidden">
          <DocumentList
            documents={savedDocuments}
            currentDocumentId={currentDocumentId}
            onLoadDocument={onLoadDocument}
            onCreateDocument={onCreateDocument}
            onDeleteDocument={onDeleteDocument}
            setSavedDocuments={setSavedDocuments}
            setDocumentId={setDocumentId}
          />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground">
          <PanelLeft className="h-3 w-3 inline mr-1" />
          <span>Collapse sidebar with Ctrl+B</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
