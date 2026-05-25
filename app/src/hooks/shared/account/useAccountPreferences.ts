"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AccountAccentColor,
  AccountNotificationPreference,
  AccountProfileDraft,
  AccountTheme,
} from "@/app/src/types/shared/account/AccountTypes";
import { DefaultAccountAccentColor } from "@/app/src/constants/shared/account/AccountConstants";

export const AccountPreferencesStorageKey = "gr8booksneo.accountPreferences";

type AccountPreferencesState = {
  hasHydrated: boolean;
  theme: AccountTheme;
  accentColor: AccountAccentColor;
  notificationPreference: AccountNotificationPreference;
  profileDrafts: Record<string, AccountProfileDraft>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setTheme: (theme: AccountTheme) => void;
  setAccentColor: (accentColor: AccountAccentColor) => void;
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
      accentColor: DefaultAccountAccentColor,
      notificationPreference: "all",
      profileDrafts: {},
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
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
      name: AccountPreferencesStorageKey,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        notificationPreference: state.notificationPreference,
        profileDrafts: state.profileDrafts,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
