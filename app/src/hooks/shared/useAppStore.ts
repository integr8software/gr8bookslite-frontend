"use client";

import { create } from "zustand";

type AppStoreState = {
  accessToken: string | null;
  activeCompanyId: number | null;
  isSidebarOpen: boolean;
  setAccessToken: (accessToken: string | null) => void;
  setActiveCompanyId: (activeCompanyId: number | null) => void;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
  resetAppStore: () => void;
};

const InitialAppStoreState = {
  accessToken: null,
  activeCompanyId: null,
  isSidebarOpen: false,
} satisfies Pick<
  AppStoreState,
  "accessToken" | "activeCompanyId" | "isSidebarOpen"
>;

export const useAppStore = create<AppStoreState>((set) => ({
  ...InitialAppStoreState,
  setAccessToken: (accessToken) => set({ accessToken }),
  setActiveCompanyId: (activeCompanyId) => set({ activeCompanyId }),
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  resetAppStore: () => set(InitialAppStoreState),
}));
