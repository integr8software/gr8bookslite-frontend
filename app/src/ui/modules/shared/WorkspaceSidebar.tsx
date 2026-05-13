"use client";

import { Building2 } from "lucide-react";
import { useWorkspaceShell } from "@/app/src/hooks/modules/workspace/useWorkspaceShell";
import { SidebarSection } from "./WorkspaceSidebarItems";
import { joinClasses } from "./WorkspaceSidebar.shared";

export function WorkspaceSidebar() {
  const { isActiveHref, isSidebarOpen, navigation, closeSidebar } =
    useWorkspaceShell();

  const workspaceSectionKeys = new Set([
    "dashboard",
    "companies",
    "users-roles",
    "permissions",
    "audit-logs",
  ]);
  const topSections = navigation.filter((section) => !section.bottom);
  const workspaceSections = topSections.filter((section) =>
    workspaceSectionKeys.has(section.key),
  );
  const moduleSections = topSections.filter(
    (section) => !workspaceSectionKeys.has(section.key),
  );
  const bottomSections = navigation.filter((section) => section.bottom);

  return (
    <aside
      className={joinClasses(
        "fixed inset-y-0 left-0 z-40 flex w-[18.5rem] flex-col border-r border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] transition-transform duration-300 lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-slate-200/80 px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-lg shadow-blue-500/20">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[1.35rem] font-semibold tracking-tight text-slate-900">
            Gr8Books
          </div>
          <div className="mt-0.5 inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-blue-700">
            ERP
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <p className="px-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Workspace
        </p>
        <div className="mt-3 space-y-1.5">
          {workspaceSections.map((section) => (
            <SidebarSection
              key={section.key}
              section={section}
              isActiveHref={isActiveHref}
              onNavigate={closeSidebar}
            />
          ))}
        </div>

        <p className="mt-8 px-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
          Modules
        </p>
        <div className="mt-3 space-y-1.5">
          {moduleSections.map((section) => (
            <SidebarSection
              key={section.key}
              section={section}
              isActiveHref={isActiveHref}
              onNavigate={closeSidebar}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200/80 px-4 py-4">
        {bottomSections.map((section) => (
          <SidebarSection
            key={section.key}
            section={section}
            isActiveHref={isActiveHref}
            onNavigate={closeSidebar}
          />
        ))}
      </div>
    </aside>
  );
}
