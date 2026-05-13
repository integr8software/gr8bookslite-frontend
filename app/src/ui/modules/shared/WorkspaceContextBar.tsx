"use client";

import { ChevronLeft } from "lucide-react";
import { useWorkspaceShell } from "@/app/src/hooks/modules/workspace/useWorkspaceShell";

export function WorkspaceContextBar() {
  const { currentBranch, currentCompany } = useWorkspaceShell();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 overflow-x-hidden border-t border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 overflow-x-hidden px-4 py-3 text-sm text-slate-600 sm:px-6 lg:pl-[20rem] lg:pr-8">
        <div className="inline-flex items-center gap-2 font-medium text-slate-700">
          <ChevronLeft className="h-4 w-4" />
          <span>Active Context:</span>
        </div>
        <p className="min-w-0 break-words">
          Company: <span className="font-semibold text-slate-900">{currentCompany.name}</span>
        </p>
        <p className="min-w-0 break-words">
          Branch: <span className="font-semibold text-slate-900">{currentBranch.name} ({currentBranch.code})</span>
        </p>
        <p>
          Fiscal Year: <span className="font-semibold text-slate-900">2024</span>
        </p>
        <p className="text-xs text-slate-500 lg:ml-auto">
          You can only view and create transactions for your accessible branches.
        </p>
      </div>
    </div>
  );
}

