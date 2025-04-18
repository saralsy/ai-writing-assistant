import { Draft } from "@/lib/types";

/**
 * Synchronizes documents from localStorage to the database
 * when the user is authenticated
 */
export async function syncDocumentsToDatabase(
  drafts: Draft[]
): Promise<boolean> {
  try {
    const response = await fetch("/api/documents/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents: drafts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Error syncing documents:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error during document sync:", error);
    return false;
  }
}

/**
 * Fetches documents from the database for authenticated users
 */
export async function fetchDocumentsFromDatabase(): Promise<Draft[] | null> {
  try {
    const response = await fetch("/api/documents/sync", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // User is not authenticated, which is fine
        return null;
      }

      const error = await response.json();
      console.error("Error fetching documents:", error);
      return null;
    }

    const documents = await response.json();

    // Convert to Draft format
    return documents.map((doc: any) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      userId: doc.userId,
    }));
  } catch (error) {
    console.error("Error during document fetch:", error);
    return null;
  }
}
