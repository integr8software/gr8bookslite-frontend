"use client";

import { Suspense, useState } from "react";
import { Users } from "lucide-react";
import {
  WorkspaceBranchUserRoleOptions,
  WorkspaceCompaniesHref,
  WorkspaceCompanyStatusOptions,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
  DefaultPhilippineContactNumber,
  PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/ContactData";
import { useWorkspaceBranchUserAction } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyAction";
import type {
  WorkspaceBranchUserFormErrors,
  WorkspaceBranchUserFormValues,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { WorkspaceCompanyActionHeader } from "./WorkspaceCompanyActionHeader";
import {
  WorkspaceCompanyField,
  WorkspaceCompanyFieldClassName,
  WorkspaceCompanySection,
} from "./WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";

const BranchUserFormId = "workspace-branch-user-form";

export function WorkspaceBranchUserAction() {
  return (
    <Suspense fallback={null}>
      <WorkspaceBranchUserActionInner />
    </Suspense>
  );
}

function WorkspaceBranchUserActionInner() {
  const action = useWorkspaceBranchUserAction();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const nextStatus = action.existingUser
    ? getNextWorkspaceCompanyStatus(action.existingUser.status)
    : "Inactive";

  if (!action.company) {
    return (
      <WorkspaceCompanyNotFound
        href={WorkspaceCompaniesHref}
        title="Company Not Found"
      />
    );
  }

  if (!action.branch) {
    return (
      <WorkspaceCompanyNotFound
        href={action.branchHref}
        title="Branch Not Found"
      />
    );
  }

  if (action.needsRecord && !action.existingUser) {
    return (
      <WorkspaceCompanyNotFound
        href={action.listHref}
        title="Branch User Not Found"
      />
    );
  }

  return (
    <section className="grid gap-5">
      <WorkspaceCompanyActionHeader
        cancelHref={action.cancelHref}
        description={`Maintain users assigned only to ${action.branch.name}. Their branch role can differ from company-level access.`}
        editHref={action.editHref}
        eyebrowIcon={Users}
        eyebrowLabel={action.branch.name}
        formId={BranchUserFormId}
        isReadonly={action.isReadonly}
        mode={action.mode}
        saveLabel="Save Branch User"
        status={action.existingUser?.status}
        title={
          action.mode === "view"
            ? "View Branch User"
            : action.mode === "edit"
              ? "Edit Branch User"
              : "Add Branch User"
        }
        onStatusChange={() => setIsStatusDialogOpen(true)}
      />
      <BranchUserFields
        errors={action.errors}
        isReadonly={action.isReadonly}
        values={action.values}
        onInputChange={action.handleInputChange}
        onSubmit={action.handleSubmit}
        onUpdateField={action.updateField}
      />
      <AppDialog
        isOpen={isStatusDialogOpen}
        isPending={action.isMutating}
        title={`Set branch user as ${nextStatus.toLowerCase()}?`}
        description={`This will mark ${
          action.existingUser?.name ?? "the selected branch user"
        } as ${nextStatus.toLowerCase()} for this branch only.`}
        confirmLabel={
          nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
        }
        tone={nextStatus === "Inactive" ? "danger" : "success"}
        onCancel={() => setIsStatusDialogOpen(false)}
        onConfirm={() => {
          action.handleStatusChange();
          setIsStatusDialogOpen(false);
        }}
      />
    </section>
  );
}

function BranchUserFields({
  errors,
  isReadonly,
  values,
  onInputChange,
  onSubmit,
  onUpdateField,
}: {
  errors: WorkspaceBranchUserFormErrors;
  isReadonly: boolean;
  values: WorkspaceBranchUserFormValues;
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onUpdateField: (
    field: keyof WorkspaceBranchUserFormValues,
    value: string,
  ) => void;
}) {
  return (
    <form id={BranchUserFormId} onSubmit={onSubmit}>
      <WorkspaceCompanySection
        title="Branch User Details"
        description="This user will appear in this branch user list only."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <WorkspaceCompanyField label="Full Name" error={errors.name} required>
            <input
              name="name"
              value={values.name}
              onChange={onInputChange}
              readOnly={isReadonly}
              className={WorkspaceCompanyFieldClassName}
            />
          </WorkspaceCompanyField>
          <WorkspaceCompanyField label="Email" error={errors.email} required>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={onInputChange}
              readOnly={isReadonly}
              className={WorkspaceCompanyFieldClassName}
            />
          </WorkspaceCompanyField>
          <WorkspaceCompanyField
            label="Contact No."
            error={errors.contactNumber}
            required
          >
            <input
              name="contactNumber"
              type="tel"
              inputMode="numeric"
              maxLength={16}
              value={values.contactNumber}
              onChange={onInputChange}
              onFocus={() => {
                if (!values.contactNumber) {
                  onUpdateField(
                    "contactNumber",
                    DefaultPhilippineContactNumber,
                  );
                }
              }}
              readOnly={isReadonly}
              className={WorkspaceCompanyFieldClassName}
              placeholder={PhilippineContactNumberPlaceholder}
            />
          </WorkspaceCompanyField>
          <WorkspaceCompanyField label="Branch Role">
            <select
              name="role"
              value={values.role}
              onChange={onInputChange}
              disabled={isReadonly}
              className={WorkspaceCompanyFieldClassName}
            >
              {WorkspaceBranchUserRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </WorkspaceCompanyField>
          <WorkspaceCompanyField label="Status">
            <select
              name="status"
              value={values.status}
              onChange={onInputChange}
              disabled={isReadonly}
              className={WorkspaceCompanyFieldClassName}
            >
              {WorkspaceCompanyStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </WorkspaceCompanyField>
        </div>
      </WorkspaceCompanySection>
    </form>
  );
}
