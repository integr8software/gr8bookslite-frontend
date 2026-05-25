"use client";

import { create } from "zustand";

type AppStoreState = {
  accessToken: string | null;
  activeCompanyId: number | null;
  isAuthSessionReady: boolean;
  isSidebarOpen: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setActiveCompanyId: (activeCompanyId: number | null) => void;
  setIsAuthSessionReady: (isAuthSessionReady: boolean) => void;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  resetAppStore: () => void;
};

const InitialAppStoreState = {
  accessToken: null,
  activeCompanyId: null,
  isAuthSessionReady: false,
  isSidebarOpen: false,
} satisfies Pick<
  AppStoreState,
  "accessToken" | "activeCompanyId" | "isAuthSessionReady" | "isSidebarOpen"
>;

export const useAppStore = create<AppStoreState>((set) => ({
  ...InitialAppStoreState,
  setAccessToken: (accessToken) => set({ accessToken }),
  setActiveCompanyId: (activeCompanyId) => set({ activeCompanyId }),
  setIsAuthSessionReady: (isAuthSessionReady) => set({ isAuthSessionReady }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  resetAppStore: () =>
    set({
      ...InitialAppStoreState,
      isAuthSessionReady: true,
    }),
}));
