"use client";

import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { WorkspaceShellContext, type WorkspaceShellContextValue } from "@/app/src/hooks/modules/workspace/useWorkspaceShell";
import { getWorkspaceShellData } from "@/app/src/services/modules/workspace/ErpWorkspaceService";

const shellData = getWorkspaceShellData();

export function WorkspaceShellProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isBranchMenuOpen, setIsBranchMenuOpen] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(
    shellData.currentCompany.id,
  );
  const [currentBranchId, setCurrentBranchId] = useState(
    shellData.branches.find((branch) => branch.isCurrent)?.id ??
      shellData.branches[0].id,
  );

  const currentCompany =
    shellData.companies.find((company) => company.id === currentCompanyId) ??
    shellData.currentCompany;
  const currentBranch =
    shellData.branches.find((branch) => branch.id === currentBranchId) ??
    shellData.branches[0];
  const headerMode = pathname.startsWith("/financial-management")
    ? "financial"
    : "workspace";
  const unreadCount = shellData.notifications.length;

  const value = useMemo<WorkspaceShellContextValue>(
    () => ({
      branches: shellData.branches,
      companies: shellData.companies,
      currentBranch,
      currentCompany,
      headerMode,
      isBranchMenuOpen,
      isSidebarOpen,
      navigation: shellData.navigation,
      notifications: shellData.notifications,
      pathname,
      profile: shellData.profile,
      unreadCount,
      setCurrentBranch: (branchId: string) => {
        setCurrentBranchId(branchId);
        setIsBranchMenuOpen(false);
      },
      setCurrentCompany: (companyId: string) => {
        setCurrentCompanyId(companyId);
      },
      toggleBranchMenu: () => setIsBranchMenuOpen((current) => !current),
      closeBranchMenu: () => setIsBranchMenuOpen(false),
      toggleSidebar: () => setIsSidebarOpen((current) => !current),
      closeSidebar: () => setIsSidebarOpen(false),
      isActiveHref: (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`),
    }),
    [currentBranch, currentCompany, headerMode, isBranchMenuOpen, isSidebarOpen, pathname, unreadCount],
  );

  return (
    <WorkspaceShellContext.Provider value={value}>
      {children}
    </WorkspaceShellContext.Provider>
  );
}

