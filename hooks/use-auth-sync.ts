"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { migrateAnonymousDrafts } from "@/lib/storage";

/**
 * Hook that listens for authentication state changes and
 * migrates anonymous documents to the user account when they sign in
 */
export function useAuthSync() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // When user signs in
    if (status === "authenticated" && session?.user?.email) {
      // Migrate any anonymous drafts to this user account
      migrateAnonymousDrafts(session.user.email);
    }
  }, [status, session]);

  return { session, status };
}
