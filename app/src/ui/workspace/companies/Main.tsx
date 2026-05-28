"use client";

import { useState } from "react";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceCompanyRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { CompanyHeader } from "@/app/src/ui/workspace/companies/CompanyHeader";
import { CompanySummaryCards } from "@/app/src/ui/workspace/companies/CompanySummaryCards";
import { CompanyTable } from "@/app/src/ui/workspace/companies/CompanyTable";

function getNextWorkspaceCompanyStatus(status: WorkspaceCompanyRecord["status"]) {
  return status === "Active" ? "Inactive" : "Active";
}

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
  const totalBranches = companyManagement.companies.reduce(
    (total, company) => total + (company.totalBranches ?? 0),
    0,
  );
  const totalUsers = companyManagement.companies.reduce(
    (total, company) => total + (company.totalUsers ?? 0),
    0,
  );

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
        isLoading={companyManagement.isLoading}
        totalBranches={totalBranches}
        totalCompanies={companyManagement.companies.length}
        totalUsers={totalUsers}
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
