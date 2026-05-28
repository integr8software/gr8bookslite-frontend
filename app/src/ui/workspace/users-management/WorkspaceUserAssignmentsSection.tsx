import Link from "next/link";
import { Building2, ExternalLink } from "lucide-react";
import type {
  WorkspaceCompanyBranchRecord,
  WorkspaceCompanyRecord,
  WorkspaceCompanyUserFormErrors,
  WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
  WorkspaceCompanyFieldClassName,
  WorkspaceCompanySection,
} from "@/app/src/ui/workspace/shared/WorkspaceFormPrimitives";
import { getBranchScopedUsersHref } from "@/app/src/ui/workspace/users-management/utils";

export function WorkspaceUserAssignmentsSection({
  availableCompanies,
  branches,
  companies,
  errors,
  isReadonly,
  selectedCompanyId,
  values,
  onAddCompany,
  onRemoveCompany,
  onSelectedCompanyChange,
  onToggleBranch,
}: {
  availableCompanies: WorkspaceCompanyRecord[];
  branches: WorkspaceCompanyBranchRecord[];
  companies: WorkspaceCompanyRecord[];
  errors: WorkspaceCompanyUserFormErrors;
  isReadonly: boolean;
  selectedCompanyId: string;
  values: WorkspaceCompanyUserFormValues;
  onAddCompany: () => void;
  onRemoveCompany: (companyId: string) => void;
  onSelectedCompanyChange: (companyId: string) => void;
  onToggleBranch: (companyId: string, branchId: string) => void;
}) {
  return (
    <WorkspaceCompanySection
      title="Company & Branch Access"
      description="Select a company first, then choose the branches or satellites where this user should appear."
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <select
          value={selectedCompanyId}
          onChange={(event) => onSelectedCompanyChange(event.target.value)}
          disabled={isReadonly || availableCompanies.length === 0}
          className={WorkspaceCompanyFieldClassName}
        >
          <option value="">Select company</option>
          {availableCompanies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onAddCompany}
          disabled={isReadonly || !selectedCompanyId}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-darknavy px-4 text-sm font-semibold text-white transition hover:bg-darknavy/90 disabled:cursor-not-allowed disabled:bg-darknavy/35"
        >
          <Building2 className="h-4 w-4" aria-hidden="true" />
          <span className="whitespace-nowrap">Add Company</span>
        </button>
      </div>
      {errors.companyAssignments ? (
        <p className="mt-2 text-xs font-medium text-coralpink">
          {errors.companyAssignments}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3">
        {values.companyAssignments.map((assignment) => {
          const company = companies.find(
            (record) => record.id === assignment.companyId,
          );
          const companyBranches = branches.filter(
            (branch) => branch.companyId === assignment.companyId,
          );

          return (
            <article
              key={assignment.companyId}
              className="rounded-lg border border-darknavy/10 bg-offwhite/40 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-darknavy">
                    {company?.name ?? "Company"}
                  </h3>
                  <p className="mt-1 text-xs text-darknavy/50">
                    {assignment.branchIds.length} selected branch access
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCompany(assignment.companyId)}
                  disabled={isReadonly}
                  className="rounded-md px-3 py-2 text-xs font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {companyBranches.map((branch) => {
                  const branchCheckboxId = `workspace-user-${assignment.companyId}-${branch.id}`;

                  return (
                    <div
                      key={branch.id}
                      className="flex items-center gap-3 rounded-md border border-darknavy/10 bg-white px-3 py-2 text-sm font-medium text-darknavy"
                    >
                      <input
                        id={branchCheckboxId}
                        type="checkbox"
                        checked={assignment.branchIds.includes(branch.id)}
                        onChange={() =>
                          onToggleBranch(assignment.companyId, branch.id)
                        }
                        disabled={isReadonly}
                        className="h-4 w-4 rounded border-darknavy/20 text-skyblue"
                      />
                      <label
                        htmlFor={branchCheckboxId}
                        className="min-w-0 flex-1 cursor-pointer truncate"
                      >
                        {branch.name}
                        {branch.isMain ? " (Head Office)" : ""}
                      </label>
                      <Link
                        href={getBranchScopedUsersHref({
                          branch,
                          company,
                          companyId: assignment.companyId,
                        })}
                        aria-label={`Open user management for ${branch.name}`}
                        className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md px-2 text-xs font-semibold text-darknavy/55 transition hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Users
                      </Link>
                    </div>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </WorkspaceCompanySection>
  );
}
