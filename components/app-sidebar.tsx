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

interface DraftSidebarProps {
  selectedDraft: Draft | null;
  setSelectedDraft: (draft: Draft | null) => void;
}

export function DraftSidebar({
  selectedDraft,
  setSelectedDraft,
}: DraftSidebarProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "alphabetical"
  >("newest");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = () => {
    const allDrafts = getAllDrafts();
    setDrafts(allDrafts);
  };

  const handleCreateNewDraft = () => {
    const newDraft: Draft = {
      id: crypto.randomUUID(),
      title: "Untitled Draft",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <SidebarInput
              placeholder="Search drafts..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 py-1">
            <SidebarGroupLabel>
              {filteredDrafts.length}{" "}
              {filteredDrafts.length === 1 ? "Draft" : "Drafts"}
            </SidebarGroupLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  {sortOrder === "newest" ? (
                    <SortDesc className="h-4 w-4" />
                  ) : sortOrder === "oldest" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortAsc className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                  Newest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                  Oldest First
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("alphabetical")}>
                  Alphabetical
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {sortedDrafts.length > 0 ? (
                sortedDrafts.map((draft) => (
                  <SidebarMenuItem key={draft.id}>
                    <SidebarMenuButton
                      onClick={() => handleSelectDraft(draft)}
                      isActive={selectedDraft?.id === draft.id}
                      tooltip={draft.title}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{draft.title}</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1 inline" />
                          {formatDistanceToNow(new Date(draft.updatedAt))}
                        </span>
                      </div>
                    </SidebarMenuButton>
                    <SidebarMenuAction
                      onClick={() => handleDeleteDraft(draft.id)}
                      showOnHover
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {searchQuery
                    ? "No drafts match your search"
                    : "No drafts yet"}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
