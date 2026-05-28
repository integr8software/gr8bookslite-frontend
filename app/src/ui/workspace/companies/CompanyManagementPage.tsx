"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, GitBranch, Plus, ShieldCheck, Users } from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceCompanyRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import {
  ModuleHeader,
  moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleMetrics } from "@/app/src/ui/shared/module/ModuleMetrics";
import { CompanyTable } from "@/app/src/ui/workspace/companies/CompanyTable";

export function CompanyManagementPage() {
  const companyManagement = useWorkspaceCompanyManagementStore((state) => ({
    branches: state.branches,
    companies: state.companies,
    deleteCompany: state.deleteCompany,
    isLoading: state.isLoading,
    isMutating: state.isMutating,
    users: state.users,
  }));
  const [pendingDeleteCompany, setPendingDeleteCompany] =
    useState<WorkspaceCompanyRecord | null>(null);
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

  async function handleConfirmDelete() {
    if (!pendingDeleteCompany) {
      return;
    }

    try {
      await companyManagement.deleteCompany(pendingDeleteCompany.id);
      setPendingDeleteCompany(null);
    } catch {
      // The mutation owns the toast message; keep the dialog open.
    }
  }

  return (
    <section className="grid gap-5">
      <ModuleHeader
        variant="card"
        titleAs="h1"
        title="Companies"
        description="Manage companies, plans, branches, and company users."
        eyebrow={
          <>
            <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
            Workspace directory
          </>
        }
        actions={
          <Link
            href={`${WorkspaceCompaniesHref}/add`}
            className={moduleHeaderActionClassNames.primary}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Company
          </Link>
        }
      />
      <ModuleMetrics
        metrics={[
          {
            icon: Building2,
            label: "Total Companies",
            helper: `${activeCompanies} active companies`,
            tone: "blue",
            value: companyManagement.isLoading ? (
              <AppSkeleton className="h-7 w-14 rounded-md" />
            ) : (
              companyManagement.companies.length
            ),
          },
          {
            icon: Users,
            label: "Total Users",
            helper: "Company-level users",
            tone: "cyan",
            value: companyManagement.isLoading ? (
              <AppSkeleton className="h-7 w-14 rounded-md" />
            ) : (
              totalUsers
            ),
          },
          {
            icon: GitBranch,
            label: "Branches",
            helper: "Across all companies",
            tone: "emerald",
            value: companyManagement.isLoading ? (
              <AppSkeleton className="h-7 w-14 rounded-md" />
            ) : (
              totalBranches
            ),
          },
          {
            icon: ShieldCheck,
            label: "Workspace Scope",
            helper: "Company, branch, and role setup",
            tone: "violet",
            value: companyManagement.isLoading ? (
              <AppSkeleton className="h-7 w-20 rounded-md" />
            ) : (
              "Admin"
            ),
          },
        ]}
      />
      <CompanyTable
        branches={companyManagement.branches}
        companies={companyManagement.companies}
        isLoading={companyManagement.isLoading}
        users={companyManagement.users}
        onDelete={setPendingDeleteCompany}
      />
      <AppDialog
        isOpen={Boolean(pendingDeleteCompany)}
        isPending={companyManagement.isMutating}
        title="Delete company?"
        description={`This will mark ${
          pendingDeleteCompany?.name ?? "the selected company"
        } as inactive while keeping users and branch records available.`}
        confirmLabel="Delete Company"
        tone="danger"
        onCancel={() => setPendingDeleteCompany(null)}
        onConfirm={() => void handleConfirmDelete()}
      />
    </section>
  );
}
