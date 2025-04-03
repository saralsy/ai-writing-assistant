import { useState } from "react";
import {
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
  FileIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  Search,
  Download,
  Upload,
  SortAsc,
  SortDesc,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SavedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

interface DocumentListProps {
  documents: SavedDocument[];
  currentDocumentId: string;
  onLoadDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  setSavedDocuments: (docs: SavedDocument[]) => void;
  setDocumentId: (id: string) => void;
}

export default function DocumentList({
  documents = [],
  currentDocumentId = "",
  onLoadDocument = () => {},
  onCreateDocument = () => {},
  onDeleteDocument = () => {},
  setSavedDocuments = () => {},
  setDocumentId = () => {},
}: DocumentListProps) {
  // Ensure documents is an array
  const docsArray = Array.isArray(documents) ? documents : [];

  // State for search and sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "alphabetical"
  >("newest");

  // Filter documents based on search
  const filteredDocuments = docsArray.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort documents based on sort order
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortOrder) {
      case "newest":
        return b.lastModified - a.lastModified;
      case "oldest":
        return a.lastModified - b.lastModified;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Add a character count and word count display
  const getDocumentStats = (content: string) => {
    if (!content) return { chars: 0, words: 0 };
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    return { chars, words };
  };

  // Export function
  const handleExportDocuments = () => {
    try {
      const dataStr = JSON.stringify(documents);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = "documents.json";

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting documents:", error);
      alert("Failed to export documents");
    }
  };

  // Import function
  const handleImportDocuments = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const fileReader = new FileReader();
      fileReader.readAsText(event.target.files?.[0] as File);
      fileReader.onload = (e) => {
        const content = e.target?.result as string;
        const importedDocs = JSON.parse(content);

        // Validate the imported data
        if (
          Array.isArray(importedDocs) &&
          importedDocs.every(
            (doc) =>
              typeof doc === "object" &&
              "id" in doc &&
              "title" in doc &&
              "content" in doc &&
              "lastModified" in doc
          )
        ) {
          // Update the documents
          setSavedDocuments(importedDocs);
          localStorage.setItem("savedDocuments", JSON.stringify(importedDocs));
        } else {
          alert("Invalid document format");
        }
      };
    } catch (error) {
      console.error("Error importing documents:", error);
      alert("Failed to import documents");
    }
  };

  return (
    <SidebarGroup>
      <div className="flex items-center justify-between px-4 py-2">
        <SidebarGroupLabel>
          Documents ({sortedDocuments.length})
        </SidebarGroupLabel>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0"
            onClick={onCreateDocument}
            title="New Document"
          >
            <PlusIcon className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 p-0">
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

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 p-0"
            onClick={handleExportDocuments}
            title="Export Documents"
          >
            <Download className="h-4 w-4" />
          </Button>

          <label className="cursor-pointer">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0"
              title="Import Documents"
              asChild
            >
              <div>
                <Upload className="h-4 w-4" />
              </div>
            </Button>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportDocuments}
            />
          </label>
        </div>
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

      <SidebarGroupContent>
        <SidebarMenu>
          {sortedDocuments.length > 0 ? (
            sortedDocuments.map((doc) => (
              <SidebarMenuItem key={doc.id}>
                <SidebarMenuButton
                  onClick={() => onLoadDocument(doc.id)}
                  isActive={currentDocumentId === doc.id}
                  tooltip={doc.title}
                >
                  <FileIcon className="h-4 w-4 shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{doc.title || "Untitled"}</span>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1 inline" />
                      {new Date(doc.lastModified).toLocaleDateString()}
                      {doc.content && (
                        <span className="ml-2">
                          {getDocumentStats(doc.content).words} words
                        </span>
                      )}
                    </span>
                  </div>
                </SidebarMenuButton>
                <SidebarMenuAction
                  onClick={() => {
                    if (
                      confirm("Are you sure you want to delete this document?")
                    ) {
                      onDeleteDocument(doc.id);
                    }
                  }}
                  showOnHover
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {searchQuery
                ? "No documents match your search"
                : "No documents yet"}
            </div>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
