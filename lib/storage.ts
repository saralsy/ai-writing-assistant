import type { Draft } from "@/lib/types";
import { getSession } from "next-auth/react";
import {
  syncDocumentsToDatabase,
  fetchDocumentsFromDatabase,
} from "./document-service";

const DRAFTS_KEY = "writing-tool-drafts";

// Helper to get user-specific key
const getUserDraftsKey = (userId: string | null) => {
  return userId ? `${DRAFTS_KEY}-${userId}` : DRAFTS_KEY;
};

// Helper to get session safely with error handling
const getSessionSafely = async () => {
  try {
    return await getSession();
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
};

export async function saveDraft(draft: Draft): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const session = await getSessionSafely();
    const userId = session?.user?.email || null;
    const storageKey = getUserDraftsKey(userId);

    // Ensure the draft has the current userId
    draft.userId = userId;

    const drafts = await getAllDrafts();
    const existingDraftIndex = drafts.findIndex((d) => d.id === draft.id);

    if (existingDraftIndex >= 0) {
      drafts[existingDraftIndex] = draft;
    } else {
      drafts.push(draft);
    }

    localStorage.setItem(storageKey, JSON.stringify(drafts));

    // Sync with database if user is authenticated
    if (userId) {
      // We don't await this to keep the save operation fast
      syncDocumentsToDatabase([draft]).catch((err) =>
        console.error("Background sync error:", err)
      );
    }
  } catch (error) {
    console.error("Error saving draft:", error);
  }
}

export async function getAllDrafts(): Promise<Draft[]> {
  if (typeof window === "undefined") return [];

  try {
    const session = await getSessionSafely();
    const userId = session?.user?.email || null;
    const storageKey = getUserDraftsKey(userId);

    // If user is authenticated, try to get documents from database first
    if (userId) {
      try {
        const dbDrafts = await fetchDocumentsFromDatabase();
        if (dbDrafts && dbDrafts.length > 0) {
          // Update local storage with the database drafts
          localStorage.setItem(storageKey, JSON.stringify(dbDrafts));
          return dbDrafts;
        }
      } catch (error) {
        console.error("Error fetching documents from database:", error);
        // Continue with localStorage as fallback
      }
    }

    // Fallback to localStorage
    const draftsJson = localStorage.getItem(storageKey);
    if (!draftsJson) return [];

    try {
      const drafts = JSON.parse(draftsJson);
      return Array.isArray(drafts)
        ? drafts.filter(
            (draft: Draft) =>
              // Only return drafts that belong to the current user or have no user
              !draft.userId || draft.userId === userId
          )
        : [];
    } catch (parseError) {
      console.error("Error parsing drafts from localStorage:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error loading drafts:", error);
    return [];
  }
}

export async function getDraftById(id: string): Promise<Draft | null> {
  if (typeof window === "undefined") return null;

  try {
    const drafts = await getAllDrafts();
    return drafts.find((draft) => draft.id === id) || null;
  } catch (error) {
    console.error("Error getting draft:", error);
    return null;
  }
}

export async function deleteDraft(id: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const session = await getSessionSafely();
    const userId = session?.user?.email || null;
    const storageKey = getUserDraftsKey(userId);

    const drafts = await getAllDrafts();
    const draftToDelete = drafts.find((draft) => draft.id === id);
    const updatedDrafts = drafts.filter((draft) => draft.id !== id);

    localStorage.setItem(storageKey, JSON.stringify(updatedDrafts));

    // If the user is authenticated, sync the deletion to the database
    if (userId && draftToDelete) {
      try {
        await fetch(`/api/documents/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error("Error deleting draft from database:", error);
      }
    }
  } catch (error) {
    console.error("Error deleting draft:", error);
  }
}

export async function clearAllDrafts(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const session = await getSessionSafely();
    const userId = session?.user?.email || null;
    const storageKey = getUserDraftsKey(userId);

    localStorage.removeItem(storageKey);

    // If user is authenticated, clear all documents from database
    if (userId) {
      try {
        await fetch("/api/documents/clear", { method: "DELETE" });
      } catch (error) {
        console.error("Error clearing drafts from database:", error);
      }
    }
  } catch (error) {
    console.error("Error clearing drafts:", error);
  }
}

// Function to migrate anonymous drafts to user account
export async function migrateAnonymousDrafts(userId: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Get anonymous drafts
    const anonymousDraftsJson = localStorage.getItem(DRAFTS_KEY);
    if (!anonymousDraftsJson) return;

    try {
      const anonymousDrafts: Draft[] = JSON.parse(anonymousDraftsJson);
      if (!anonymousDrafts.length) return;

      // Get user drafts
      const userStorageKey = getUserDraftsKey(userId);
      const userDraftsJson = localStorage.getItem(userStorageKey);
      let userDrafts: Draft[] = [];

      if (userDraftsJson) {
        try {
          userDrafts = JSON.parse(userDraftsJson);
        } catch (parseError) {
          console.error("Error parsing user drafts:", parseError);
        }
      }

      // Assign userId to anonymous drafts and merge with user drafts
      const migratedDrafts = [
        ...userDrafts,
        ...anonymousDrafts.map((draft) => ({
          ...draft,
          userId,
          updatedAt: new Date().toISOString(), // Update the timestamp
        })),
      ];

      // Save merged drafts to user storage
      localStorage.setItem(userStorageKey, JSON.stringify(migratedDrafts));

      // Clear anonymous drafts
      localStorage.removeItem(DRAFTS_KEY);

      // Sync all drafts to database
      await syncDocumentsToDatabase(migratedDrafts);
    } catch (parseError) {
      console.error("Error parsing anonymous drafts:", parseError);
    }
  } catch (error) {
    console.error("Error migrating drafts:", error);
  }
}
