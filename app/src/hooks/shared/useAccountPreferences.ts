"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AccountNotificationPreference,
  AccountProfileDraft,
  AccountTheme,
} from "@/app/src/types/shared/AccountTypes";

type AccountPreferencesState = {
  hasHydrated: boolean;
  theme: AccountTheme;
  notificationPreference: AccountNotificationPreference;
  profileDrafts: Record<string, AccountProfileDraft>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setTheme: (theme: AccountTheme) => void;
  setNotificationPreference: (
    notificationPreference: AccountNotificationPreference,
  ) => void;
  updateProfileDraft: (
    userId: string,
    updates: Partial<AccountProfileDraft>,
  ) => void;
};

export const useAccountPreferences = create<AccountPreferencesState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      theme: "classic-light",
      notificationPreference: "all",
      profileDrafts: {},
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTheme: (theme) => set({ theme }),
      setNotificationPreference: (notificationPreference) =>
        set({ notificationPreference }),
      updateProfileDraft: (userId, updates) =>
        set((state) => ({
          profileDrafts: {
            ...state.profileDrafts,
            [userId]: {
              ...state.profileDrafts[userId],
              ...updates,
            },
          },
        })),
    }),
    {
      name: "gr8bookslite.accountPreferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        notificationPreference: state.notificationPreference,
        profileDrafts: state.profileDrafts,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
