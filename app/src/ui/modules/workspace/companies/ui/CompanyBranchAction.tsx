"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { GitBranch, Users } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	WorkspaceCompanyBranchKindOptions,
	WorkspaceCompanyStatusOptions,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
	DefaultPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/ContactData";
import { useWorkspaceCompanyBranchAction } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyAction";
import type {
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { WorkspaceCompanyActionHeader } from "./WorkspaceCompanyActionHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "./WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";

const CompanyBranchFormId = "workspace-company-branch-form";

export function WorkspaceCompanyBranchAction() {
	return (
		<Suspense fallback={null}>
			<WorkspaceCompanyBranchActionInner />
		</Suspense>
	);
}

function WorkspaceCompanyBranchActionInner() {
	const action = useWorkspaceCompanyBranchAction();
	const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
	const nextStatus = action.existingBranch
		? getNextWorkspaceCompanyStatus(action.existingBranch.status)
		: "Inactive";

	if (!action.company) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	if (action.needsRecord && !action.existingBranch) {
		return (
			<WorkspaceCompanyNotFound
				href={action.listHref}
				title="Branch Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<WorkspaceCompanyActionHeader
				cancelHref={action.cancelHref}
				description="Maintain branch and satellite records. Branch users are managed from the branch user list."
				editHref={action.editHref}
				eyebrowIcon={GitBranch}
				eyebrowLabel={action.company.name}
				extraActions={
					action.mode === "view" && action.usersHref ? (
						<Link
							href={action.usersHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							<Users className="h-4 w-4" aria-hidden="true" />
							Branch Users
						</Link>
					) : null
				}
				formId={CompanyBranchFormId}
				isReadonly={action.isReadonly}
				mode={action.mode}
				saveLabel="Save Branch"
				status={action.existingBranch?.status}
				title={
					action.mode === "view"
						? "View Branch"
						: action.mode === "edit"
							? "Edit Branch"
							: "Add Branch"
				}
				onStatusChange={() => setIsStatusDialogOpen(true)}
			/>
			<CompanyBranchFields
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
				title={`Set branch as ${nextStatus.toLowerCase()}?`}
				description={`This will mark ${
					action.existingBranch?.name ?? "the selected branch"
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

function CompanyBranchFields({
	errors,
	isReadonly,
	values,
	onInputChange,
	onSubmit,
	onUpdateField,
}: {
	errors: WorkspaceCompanyBranchFormErrors;
	isReadonly: boolean;
	values: WorkspaceCompanyBranchFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onUpdateField: (
		field: keyof WorkspaceCompanyBranchFormValues,
		value: string,
	) => void;
}) {
	return (
		<form id={CompanyBranchFormId} onSubmit={onSubmit}>
			<WorkspaceCompanySection
				title="Branch Details"
				description="Branch setup controls where branch-specific users and roles live."
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField label="Branch Code" error={errors.code} required>
						<input
							name="code"
							value={values.code}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Branch Name" error={errors.name} required>
						<input
							name="name"
							value={values.name}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Branch Type">
						<select
							name="branchType"
							value={values.branchType}
							onChange={onInputChange}
							disabled={isReadonly}
							className={WorkspaceCompanyFieldClassName}
						>
							{WorkspaceCompanyBranchKindOptions.map((kind) => (
								<option key={kind} value={kind}>
									{kind}
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

			<WorkspaceCompanySection
				title="Tax & Contact"
				description="These fields identify the branch in documents and branch switcher surfaces."
				className="mt-5"
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField label="TIN" error={errors.tin} required>
						<input
							name="tin"
							value={values.tin}
							onChange={onInputChange}
							readOnly={isReadonly}
							maxLength={15}
							className={WorkspaceCompanyFieldClassName}
							placeholder="000-000-000-000"
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
					<WorkspaceCompanyField label="Address" error={errors.address} required>
						<input
							name="address"
							value={values.address}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
				</div>
			</WorkspaceCompanySection>
		</form>
	);
}
