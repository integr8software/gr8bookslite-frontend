"use client";

import { useBranchManagementStore } from "@/app/src/hooks/modules/system-administration/branch-management/useBranchManagement";
import { BranchManagementHeader } from "./BranchManagementHeader";
import { BranchManagementTable } from "./BranchManagementTable";

export function BranchManagementMain() {
  const branches = useBranchManagementStore((state) => state.branches);
  const deleteBranch = useBranchManagementStore((state) => state.deleteBranch);

  function handleDeleteBranch(branchId: string, branchName: string) {
    if (!window.confirm(`Delete ${branchName}?`)) {
      return;
    }

    deleteBranch(branchId);
  }

  return (
    <section className="grid gap-5">
      <BranchManagementHeader />
      <BranchManagementTable
        branches={branches}
        onDeleteBranch={handleDeleteBranch}
      />
    </section>
  );
}
