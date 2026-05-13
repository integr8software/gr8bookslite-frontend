"use client";

import { createContext, useContext } from "react";
import type {
  ErpBranch,
  ErpCompany,
  ErpNavItem,
  ErpNavSection,
} from "@/app/src/data/modules/workspace/ErpWorkspaceTypes";
import { getWorkspaceShellData } from "@/app/src/services/modules/workspace/ErpWorkspaceService";

export type WorkspaceShellContextValue = {
  branches: ErpBranch[];
  companies: ErpCompany[];
  currentBranch: ErpBranch;
  currentCompany: ReturnType<typeof getWorkspaceShellData>["currentCompany"];
  headerMode: "workspace" | "financial";
  isBranchMenuOpen: boolean;
  isSidebarOpen: boolean;
  navigation: ErpNavSection[];
  notifications: ReturnType<typeof getWorkspaceShellData>["notifications"];
  pathname: string;
  profile: ReturnType<typeof getWorkspaceShellData>["profile"];
  unreadCount: number;
  setCurrentBranch: (branchId: string) => void;
  setCurrentCompany: (companyId: string) => void;
  toggleBranchMenu: () => void;
  closeBranchMenu: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isActiveHref: (href: string) => boolean;
};

export const WorkspaceShellContext =
  createContext<WorkspaceShellContextValue | null>(null);

export function useWorkspaceShell() {
  const context = useContext(WorkspaceShellContext);

  if (!context) {
    throw new Error("useWorkspaceShell must be used within WorkspaceShellProvider.");
  }

  return context;
}

export function flattenWorkspaceNavigation(sections: ErpNavSection[]) {
  return sections.flatMap((section) => flattenNavItems(section.children ?? []));
}

function flattenNavItems(items: ErpNavItem[]): ErpNavItem[] {
  return items.flatMap((item) => [item, ...flattenNavItems(item.children ?? [])]);
}
