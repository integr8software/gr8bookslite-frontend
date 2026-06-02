"use client";

import { create } from "zustand";

type AppStoreState = {
  accessToken: string | null;
  activeBranchId: number | null;
  activeBranchName: string | null;
  activeCompanyId: number | null;
  activeCompanyName: string | null;
  isAuthSessionReady: boolean;
  isSidebarOpen: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setActiveBranchContext: (
    activeBranchId: number | null,
    activeBranchName?: string | null,
  ) => void;
  setActiveCompanyId: (activeCompanyId: number | null) => void;
  setActiveCompanyName: (activeCompanyName: string | null) => void;
  setIsAuthSessionReady: (isAuthSessionReady: boolean) => void;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  resetAppStore: () => void;
};

const InitialAppStoreState = {
  accessToken: null,
  activeBranchId: null,
  activeBranchName: null,
  activeCompanyId: null,
  activeCompanyName: null,
  isAuthSessionReady: false,
  isSidebarOpen: false,
} satisfies Pick<
  AppStoreState,
  | "accessToken"
  | "activeBranchId"
  | "activeBranchName"
  | "activeCompanyId"
  | "activeCompanyName"
  | "isAuthSessionReady"
  | "isSidebarOpen"
>;

export const useAppStore = create<AppStoreState>((set) => ({
  ...InitialAppStoreState,
  setAccessToken: (accessToken) => set({ accessToken }),
  setActiveBranchContext: (activeBranchId, activeBranchName = null) =>
    set({ activeBranchId, activeBranchName }),
  setActiveCompanyId: (activeCompanyId) => set({ activeCompanyId }),
  setActiveCompanyName: (activeCompanyName) => set({ activeCompanyName }),
  setIsAuthSessionReady: (isAuthSessionReady) => set({ isAuthSessionReady }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  resetAppStore: () =>
    set({
      ...InitialAppStoreState,
      isAuthSessionReady: true,
    }),
}));
