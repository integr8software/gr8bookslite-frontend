"use client";

import { useCallback, useState } from "react";

const ModuleDiscardReturnToListStorageKey = "gr8books:module-draft:discard-return-to-list";

export function useModuleDiscardPreference() {
  const [shouldReturnToList, setShouldReturnToList] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    try {
      const storedValue = window.localStorage.getItem(ModuleDiscardReturnToListStorageKey);

      return storedValue === null ? true : storedValue === "true";
    } catch {
      return true;
    }
  });

  const updateShouldReturnToList = useCallback((value: boolean) => {
    setShouldReturnToList(value);

    try {
      window.localStorage.setItem(ModuleDiscardReturnToListStorageKey, String(value));
    } catch {
      // The preference remains active for this session when storage is unavailable.
    }
  }, []);

  return { shouldReturnToList, updateShouldReturnToList };
}
