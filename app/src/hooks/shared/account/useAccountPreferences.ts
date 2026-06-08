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
import { AccountPreferencesStorageKey } from "@/app/src/constants/shared/account/AccountThemeRoutes";

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
  clearProfileDraft: (userId: string) => void;
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
      clearProfileDraft: (userId) =>
        set((state) => {
          const nextProfileDrafts = { ...state.profileDrafts };
          delete nextProfileDrafts[userId];

          return {
            profileDrafts: nextProfileDrafts,
          };
        }),
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
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as Partial<AccountPreferencesState>;

        return {
          ...state,
          profileDrafts: {},
        };
      },
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        notificationPreference: state.notificationPreference,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
