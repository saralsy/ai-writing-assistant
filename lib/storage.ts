import type { Draft } from "@/lib/types";

const DRAFTS_KEY = "writing-tool-drafts";

export function saveDraft(draft: Draft): void {
  if (typeof window === "undefined") return;

  try {
    const drafts = getAllDrafts();
    const existingDraftIndex = drafts.findIndex((d) => d.id === draft.id);

    if (existingDraftIndex >= 0) {
      drafts[existingDraftIndex] = draft;
    } else {
      drafts.push(draft);
    }

    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch (error) {
    console.error("Error saving draft:", error);
  }
}

export function getAllDrafts(): Draft[] {
  if (typeof window === "undefined") return [];

  try {
    const draftsJson = localStorage.getItem(DRAFTS_KEY);
    return draftsJson ? JSON.parse(draftsJson) : [];
  } catch (error) {
    console.error("Error loading drafts:", error);
    return [];
  }
}

export function getDraftById(id: string): Draft | null {
  if (typeof window === "undefined") return null;

  try {
    const drafts = getAllDrafts();
    return drafts.find((draft) => draft.id === id) || null;
  } catch (error) {
    console.error("Error getting draft:", error);
    return null;
  }
}

export function deleteDraft(id: string): void {
  if (typeof window === "undefined") return;

  try {
    const drafts = getAllDrafts();
    const updatedDrafts = drafts.filter((draft) => draft.id !== id);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(updatedDrafts));
  } catch (error) {
    console.error("Error deleting draft:", error);
  }
}

export function clearAllDrafts(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(DRAFTS_KEY);
  } catch (error) {
    console.error("Error clearing drafts:", error);
  }
}
