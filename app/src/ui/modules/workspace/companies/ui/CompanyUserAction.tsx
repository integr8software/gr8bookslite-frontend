"use client";

import { Suspense, useState } from "react";
import { Users } from "lucide-react";
import {
	WorkspaceCompanyStatusOptions,
	WorkspaceCompanyUserRoleOptions,
	WorkspaceCompaniesHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
	DefaultPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/ContactData";
import { useWorkspaceCompanyUserAction } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyAction";
import type {
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { WorkspaceCompanyActionHeader } from "./WorkspaceCompanyActionHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "./WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";

const CompanyUserFormId = "workspace-company-user-form";

export function WorkspaceCompanyUserAction() {
	return (
		<Suspense fallback={null}>
			<WorkspaceCompanyUserActionInner />
		</Suspense>
	);
}

function WorkspaceCompanyUserActionInner() {
	const action = useWorkspaceCompanyUserAction();
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

	if (action.needsRecord && !action.existingUser) {
		return (
			<WorkspaceCompanyNotFound
				href={action.listHref}
				title="Company User Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<WorkspaceCompanyActionHeader
				cancelHref={action.cancelHref}
				description="Maintain company-level access. Branch-specific roles are assigned from a branch user list."
				editHref={action.editHref}
				eyebrowIcon={Users}
				eyebrowLabel={action.company.name}
				formId={CompanyUserFormId}
				isReadonly={action.isReadonly}
				mode={action.mode}
				saveLabel="Save User"
				status={action.existingUser?.status}
				title={
					action.mode === "view"
						? "View User"
						: action.mode === "edit"
							? "Edit User"
							: "Add User"
				}
				onStatusChange={() => setIsStatusDialogOpen(true)}
			/>
			<CompanyUserFields
				errors={action.errors}
				isReadonly={action.isReadonly}
				values={action.values}
				onInputChange={action.handleInputChange}
				onSubmit={action.handleSubmit}
				onUpdateField={action.updateField}
			/>
			<AppConfirmDialog
				isOpen={isStatusDialogOpen}
				isPending={action.isMutating}
				title={`Set user as ${nextStatus.toLowerCase()}?`}
				description={`This will mark ${
					action.existingUser?.name ?? "the selected user"
				} as ${nextStatus.toLowerCase()}.`}
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

function CompanyUserFields({
	errors,
	isReadonly,
	values,
	onInputChange,
	onSubmit,
	onUpdateField,
}: {
	errors: WorkspaceCompanyUserFormErrors;
	isReadonly: boolean;
	values: WorkspaceCompanyUserFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onUpdateField: (
		field: keyof WorkspaceCompanyUserFormValues,
		value: string,
	) => void;
}) {
	return (
		<form id={CompanyUserFormId} onSubmit={onSubmit}>
			<WorkspaceCompanySection
				title="User Details"
				description="Company users can be assigned to branches later with separate branch roles."
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
									onUpdateField("contactNumber", DefaultPhilippineContactNumber);
								}
							}}
							readOnly={isReadonly}
							className={WorkspaceCompanyFieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Role">
						<select
							name="role"
							value={values.role}
							onChange={onInputChange}
							disabled={isReadonly}
							className={WorkspaceCompanyFieldClassName}
						>
							{WorkspaceCompanyUserRoleOptions.map((role) => (
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
