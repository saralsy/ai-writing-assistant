"use client";
import { useState, useEffect } from "react";
import WritingEditor from "@/components/writing-editor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { DraftSidebar } from "@/components/app-sidebar";
import { Draft } from "@/lib/types";
import { useAuthSync } from "@/hooks/use-auth-sync";
import { getAllDrafts, saveDraft, deleteDraft } from "@/lib/storage";

// Define the SavedDocument interface
interface SavedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export default function HomePage() {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const { session, status } = useAuthSync();

  // Document state
  const [documentId, setDocumentId] = useState<string>("");
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved documents when authentication state changes
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      // First load all documents
      try {
        const userDrafts = await getAllDrafts();
        // Convert drafts to SavedDocument format
        const convertedDocs: SavedDocument[] = userDrafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          content: draft.content,
          lastModified: new Date(draft.updatedAt).getTime(),
        }));

        setSavedDocuments(convertedDocs);

        // Then check for document ID in URL
        const urlParams = new URLSearchParams(window.location.search);
        const docId = urlParams.get("id");

        if (docId) {
          // Find the document in the loaded documents
          const doc = convertedDocs.find((d: SavedDocument) => d.id === docId);
          if (doc) {
            setDocumentId(docId);
          } else {
            createNewDocument();
          }
        } else if (convertedDocs.length > 0) {
          // If no document ID in URL but we have documents, load the most recent one
          const mostRecent = convertedDocs.sort(
            (a, b) => b.lastModified - a.lastModified
          )[0];
          setDocumentId(mostRecent.id);
          updateUrlWithDocumentId(mostRecent.id);
        } else {
          // No documents, create a new one
          createNewDocument();
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        createNewDocument();
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data when authentication state is determined
    if (status !== "loading") {
      loadInitialData();
    }
  }, [status]);

  // Load a specific document by ID
  const loadDocument = async (id: string) => {
    try {
      // Find the document in the current state
      const doc = savedDocuments.find((doc) => doc.id === id);

      if (doc) {
        setDocumentId(doc.id);
        // Update URL
        updateUrlWithDocumentId(id);
      } else {
        // If document not found in current state, try to load all drafts again
        const userDrafts = await getAllDrafts();
        const convertedDocs: SavedDocument[] = userDrafts.map((draft) => ({
          id: draft.id,
          title: draft.title,
          content: draft.content,
          lastModified: new Date(draft.updatedAt).getTime(),
        }));

        setSavedDocuments(convertedDocs);

        const docFromStorage = convertedDocs.find((d) => d.id === id);
        if (docFromStorage) {
          setDocumentId(docFromStorage.id);
          updateUrlWithDocumentId(id);
        } else {
          // If still not found, create a new document
          createNewDocument();
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
      // Fallback to creating a new document
      createNewDocument();
    }
  };

  // Create a new document
  const createNewDocument = async () => {
    try {
      const newId = crypto.randomUUID();
      setDocumentId(newId);

      // Create an empty document in the saved documents
      const newDraft: Draft = {
        id: newId,
        title: "Untitled Document",
        content: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: session?.user?.email || null,
      };

      // Save to storage
      await saveDraft(newDraft);

      // Add to saved documents state
      const newDoc: SavedDocument = {
        id: newId,
        title: "Untitled Document",
        content: "",
        lastModified: Date.now(),
      };

      setSavedDocuments((prev) => [...prev, newDoc]);

      // Update URL
      updateUrlWithDocumentId(newId);
    } catch (error) {
      console.error("Error creating new document:", error);
    }
  };

  // Delete a document
  const deleteDocument = async (id: string) => {
    try {
      // Delete from storage
      await deleteDraft(id);

      // Update local state
      const updatedDocs = savedDocuments.filter((doc) => doc.id !== id);
      setSavedDocuments(updatedDocs);

      // If the current document was deleted and there are no other documents, create a new one
      if (id === documentId) {
        if (updatedDocs.length > 0) {
          // Open another existing document
          loadDocument(updatedDocs[0].id);
        } else {
          // No more documents, create a new one
          createNewDocument();
        }
      }
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  // Update URL with document ID for bookmarking/sharing
  const updateUrlWithDocumentId = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("id", id);
    window.history.replaceState({}, "", url);
  };

  // Save document (will be called from the editor)
  const saveDocument = async (doc: SavedDocument) => {
    try {
      // Find and update the document if it exists, or add it if it doesn't
      const updatedDocs = [...savedDocuments];
      const existingDocIndex = updatedDocs.findIndex((d) => d.id === doc.id);

      if (existingDocIndex >= 0) {
        updatedDocs[existingDocIndex] = doc;
      } else {
        updatedDocs.push(doc);
      }

      // Save to storage in Draft format
      const draftToSave: Draft = {
        id: doc.id,
        title: doc.title,
        content: doc.content,
        createdAt: new Date(doc.lastModified).toISOString(), // Approximation
        updatedAt: new Date().toISOString(),
        userId: session?.user?.email || null,
      };

      await saveDraft(draftToSave);

      // Update local state
      setSavedDocuments(updatedDocs);
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  if (isLoading && status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-primary/20"></div>
          <p className="text-muted-foreground">Loading your writing space...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="h-screen flex overflow-hidden w-full">
        <DraftSidebar
          selectedDraft={selectedDraft}
          setSelectedDraft={setSelectedDraft}
          savedDocuments={savedDocuments}
          currentDocumentId={documentId}
          onLoadDocument={loadDocument}
          onCreateDocument={createNewDocument}
          onDeleteDocument={deleteDocument}
          setSavedDocuments={setSavedDocuments}
          setDocumentId={setDocumentId}
        />
        <SidebarInset className="flex-1 overflow-hidden p-0 w-full max-w-full">
          <WritingEditor
            documentId={documentId}
            savedDocuments={savedDocuments}
            onSaveDocument={saveDocument}
            currentDocument={savedDocuments.find(
              (doc) => doc.id === documentId
            )}
            setSavedDocuments={setSavedDocuments}
            setDocumentId={setDocumentId}
          />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
