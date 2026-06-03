"use client";

import { create } from "zustand";

type AppStoreState = {
  accessToken: string | null;
  activeBranchId: number | null;
  activeBranchName: string | null;
  activeCompanyId: number | null;
  activeCompanyName: string | null;
  isAuthSessionReady: boolean;
  isShellContextSettling: boolean;
  shellContextSwitchMessage: string | null;
  isSidebarOpen: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setActiveBranchContext: (
    activeBranchId: number | null,
    activeBranchName?: string | null,
  ) => void;
  setActiveCompanyId: (activeCompanyId: number | null) => void;
  setActiveCompanyName: (activeCompanyName: string | null) => void;
  setIsAuthSessionReady: (isAuthSessionReady: boolean) => void;
  beginShellContextSwitch: (message: string) => void;
  endShellContextSwitch: () => void;
  finishShellContextSettling: () => void;
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
  isShellContextSettling: false,
  shellContextSwitchMessage: null,
  isSidebarOpen: false,
} satisfies Pick<
  AppStoreState,
  | "accessToken"
  | "activeBranchId"
  | "activeBranchName"
  | "activeCompanyId"
  | "activeCompanyName"
  | "isAuthSessionReady"
  | "isShellContextSettling"
  | "shellContextSwitchMessage"
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
  beginShellContextSwitch: (shellContextSwitchMessage) =>
    set({ isShellContextSettling: true, shellContextSwitchMessage }),
  endShellContextSwitch: () => set({ shellContextSwitchMessage: null }),
  finishShellContextSettling: () => set({ isShellContextSettling: false }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  resetAppStore: () =>
    set({
      ...InitialAppStoreState,
      isAuthSessionReady: true,
    }),
}));
