"use client";

import { useSyncExternalStore } from "react";
import { isAdmin } from "@/lib/auth";

function subscribeToAuthChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getAdminSnapshot() {
  return isAdmin();
}

function getServerAdminSnapshot() {
  return false;
}

export function useAdmin() {
  return useSyncExternalStore(
    subscribeToAuthChanges,
    getAdminSnapshot,
    getServerAdminSnapshot
  );
}
