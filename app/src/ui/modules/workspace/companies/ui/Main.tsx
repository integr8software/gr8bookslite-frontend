"use client";

import { useState } from "react";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceCompanyRecord } from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { CompanyHeader } from "@/app/src/ui/modules/workspace/companies/ui/CompanyHeader";
import { CompanySummaryCards } from "@/app/src/ui/modules/workspace/companies/ui/CompanySummaryCards";
import { CompanyTable } from "@/app/src/ui/modules/workspace/companies/ui/CompanyTable";

export function WorkspaceCompaniesMain() {
  const companyManagement = useWorkspaceCompanyManagementStore((state) => ({
    branchUsers: state.branchUsers,
    branches: state.branches,
    companies: state.companies,
    isLoading: state.isLoading,
    isMutating: state.isMutating,
    updateCompany: state.updateCompany,
    users: state.users,
  }));
  const [pendingStatusCompany, setPendingStatusCompany] =
    useState<WorkspaceCompanyRecord | null>(null);
  const nextStatus = pendingStatusCompany
    ? getNextWorkspaceCompanyStatus(pendingStatusCompany.status)
    : "Inactive";
  const activeCompanies = companyManagement.companies.filter(
    (company) => company.status === "Active",
  ).length;

  function handleConfirmStatusChange() {
    if (!pendingStatusCompany) {
      return;
    }

    companyManagement.updateCompany({
      ...pendingStatusCompany,
      status: nextStatus,
    });
    setPendingStatusCompany(null);
  }

  return (
    <section className="grid gap-5">
      <CompanyHeader />
      <CompanySummaryCards
        activeCompanies={activeCompanies}
        totalBranches={companyManagement.branches.length}
        totalCompanies={companyManagement.companies.length}
        totalUsers={companyManagement.users.length}
      />
      <CompanyTable
        branches={companyManagement.branches}
        companies={companyManagement.companies}
        isLoading={companyManagement.isLoading}
        users={companyManagement.users}
        onStatusChange={setPendingStatusCompany}
      />
      <AppDialog
        isOpen={Boolean(pendingStatusCompany)}
        isPending={companyManagement.isMutating}
        title={
          nextStatus === "Inactive"
            ? "Set company as inactive?"
            : "Set company as active?"
        }
        description={`This will mark ${
          pendingStatusCompany?.name ?? "the selected company"
        } as ${nextStatus.toLowerCase()} while keeping users and branch records available.`}
        confirmLabel={
          nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
        }
        tone={nextStatus === "Inactive" ? "danger" : "success"}
        onCancel={() => setPendingStatusCompany(null)}
        onConfirm={handleConfirmStatusChange}
      />
    </section>
  );
}
