"use client";

import type { ReactNode } from "react";
import { useWorkspaceShell } from "@/app/src/hooks/modules/workspace/useWorkspaceShell";
import { WorkspaceContextBar } from "./WorkspaceContextBar";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceShellProvider } from "./WorkspaceShellProvider";
import { WorkspaceSidebar } from "./WorkspaceSidebar";

export function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <WorkspaceShellProvider>
      <WorkspaceShell>{children}</WorkspaceShell>
    </WorkspaceShellProvider>
  );
}

function WorkspaceShell({ children }: { children: ReactNode }) {
  const { closeSidebar, isSidebarOpen } = useWorkspaceShell();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f9fc] text-slate-900">
      <WorkspaceSidebar />
      {isSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          onClick={closeSidebar}
        />
      ) : null}
      <div className="min-h-screen overflow-x-hidden lg:pl-[18.5rem]">
        <WorkspaceHeader />
        <main className="overflow-x-hidden px-4 pb-28 pt-6 sm:px-6 lg:px-8">{children}</main>
      </div>
      <WorkspaceContextBar />
    </div>
  );
}

