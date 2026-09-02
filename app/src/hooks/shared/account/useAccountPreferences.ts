"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AccountAccentColor,
  AccountFontSize,
  AccountNotificationPreference,
  AccountProfileDraft,
  AccountTheme,
} from "@/app/src/types/shared/account/AccountTypes";
import { DefaultAccountAccentColor, DefaultAccountFontSize } from "@/app/src/constants/shared/account/AccountConstants";
import { AccountPreferencesStorageKey } from "@/app/src/constants/shared/account/AccountThemeRoutes";

type AccountPreferencesState = {
  hasHydrated: boolean;
  theme: AccountTheme;
  fontSize: AccountFontSize;
  accentColor: AccountAccentColor;
  notificationPreference: AccountNotificationPreference;
  profileDrafts: Record<string, AccountProfileDraft>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setTheme: (theme: AccountTheme) => void;
  setFontSize: (fontSize: AccountFontSize) => void;
  setAccentColor: (accentColor: AccountAccentColor) => void;
  setNotificationPreference: (notificationPreference: AccountNotificationPreference) => void;
  clearProfileDraft: (userId: string) => void;
  updateProfileDraft: (userId: string, updates: Partial<AccountProfileDraft>) => void;
};

export const useAccountPreferences = create<AccountPreferencesState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      theme: "system",
      fontSize: DefaultAccountFontSize,
      accentColor: DefaultAccountAccentColor,
      notificationPreference: "all",
      profileDrafts: {},
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setNotificationPreference: (notificationPreference) => set({ notificationPreference }),
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
        fontSize: state.fontSize,
        accentColor: state.accentColor,
        notificationPreference: state.notificationPreference,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
