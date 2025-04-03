"use client";
import { useState, useEffect } from "react";
import WritingEditor from "@/components/writing-editor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { DraftSidebar } from "@/components/app-sidebar";
import { Draft } from "@/lib/types";

// Define the SavedDocument interface
interface SavedDocument {
  id: string;
  title: string;
  content: string;
  lastModified: number;
}

export default function HomePage() {
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  // Document state
  const [documentId, setDocumentId] = useState<string>("");
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([]);

  // Load saved documents on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      // First load all documents
      try {
        const savedDocs = localStorage.getItem("savedDocuments");
        if (savedDocs) {
          const parsedDocs = JSON.parse(savedDocs);
          setSavedDocuments(parsedDocs);

          // Then check for document ID in URL
          const urlParams = new URLSearchParams(window.location.search);
          const docId = urlParams.get("id");

          if (docId) {
            // Find the document in the loaded documents
            const doc = parsedDocs.find((d: SavedDocument) => d.id === docId);
            if (doc) {
              setDocumentId(docId);
            } else {
              createNewDocument();
            }
          } else {
            createNewDocument();
          }
        } else {
          // No documents in storage, create a new one
          createNewDocument();
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        createNewDocument();
      }
    };

    loadInitialData();
  }, []);

  // Load all saved documents from localStorage
  const loadSavedDocuments = () => {
    try {
      const savedDocs = localStorage.getItem("savedDocuments");
      if (savedDocs) {
        setSavedDocuments(JSON.parse(savedDocs));
      }
    } catch (error) {
      console.error("Error loading saved documents:", error);
    }
  };

  // Load a specific document by ID
  const loadDocument = (id: string) => {
    try {
      // Find the document in the current state
      const doc = savedDocuments.find((doc) => doc.id === id);

      if (doc) {
        setDocumentId(doc.id);
        // Update URL
        updateUrlWithDocumentId(id);
      } else {
        // If document not found in current state, try to load from localStorage directly
        const savedDocs = localStorage.getItem("savedDocuments");
        if (savedDocs) {
          const parsedDocs = JSON.parse(savedDocs);
          const docFromStorage = parsedDocs.find(
            (d: SavedDocument) => d.id === id
          );

          if (docFromStorage) {
            setDocumentId(docFromStorage.id);
            setSavedDocuments(parsedDocs);
            updateUrlWithDocumentId(id);
          } else {
            // If still not found, create a new document
            createNewDocument();
          }
        } else {
          // No documents in storage, create a new one
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
  const createNewDocument = () => {
    try {
      const newId = Date.now().toString();
      setDocumentId(newId);

      // Create an empty document in the saved documents
      const newDoc: SavedDocument = {
        id: newId,
        title: "Untitled Document",
        content: "",
        lastModified: Date.now(),
      };

      // Add to saved documents
      const updatedDocs = [...savedDocuments, newDoc];
      setSavedDocuments(updatedDocs);
      localStorage.setItem("savedDocuments", JSON.stringify(updatedDocs));

      // Update URL
      updateUrlWithDocumentId(newId);
    } catch (error) {
      console.error("Error creating new document:", error);
    }
  };

  // Delete a document
  const deleteDocument = (id: string) => {
    try {
      const updatedDocs = savedDocuments.filter((doc) => doc.id !== id);
      setSavedDocuments(updatedDocs);
      localStorage.setItem("savedDocuments", JSON.stringify(updatedDocs));

      // If the current document was deleted, create a new one
      if (id === documentId) {
        createNewDocument();
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
  const saveDocument = (doc: SavedDocument) => {
    try {
      // Find and update the document if it exists, or add it if it doesn't
      const updatedDocs = [...savedDocuments];
      const existingDocIndex = updatedDocs.findIndex((d) => d.id === doc.id);

      if (existingDocIndex >= 0) {
        updatedDocs[existingDocIndex] = doc;
      } else {
        updatedDocs.push(doc);
      }

      // Save to state and localStorage
      setSavedDocuments(updatedDocs);
      localStorage.setItem("savedDocuments", JSON.stringify(updatedDocs));
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

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
