"use client";

import { Suspense, type ReactNode } from "react";
import {
	Building2,
	GitBranch,
	type LucideIcon,
} from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import {
	DefaultPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/contact/ContactData";
import { useWorkspaceCompanyBranchAction } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyAction";
import type {
	WorkspaceCompanyBranchFormErrors,
	WorkspaceCompanyBranchFormValues,
	WorkspaceCompanyBranchKind,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import { WorkspaceCompanyActionHeader } from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyActionHeader";
import { WorkspaceCompanyNotFound } from "@/app/src/ui/modules/workspace/companies/ui/WorkspaceCompanyNotFound";

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
				description="Maintain branch and satellite records. User access is assigned from Workspace Users Management."
				editHref={action.editHref}
				eyebrowIcon={GitBranch}
				eyebrowLabel={action.company.name}
				formId={CompanyBranchFormId}
				isReadonly={action.isReadonly}
				mode={action.mode}
				saveLabel="Save Branch"
				title={
					action.mode === "view"
						? "View Branch"
						: action.mode === "edit"
							? "Edit Branch"
							: "Add Branch"
				}
			/>
			<CompanyBranchFields
				errors={action.errors}
				isReadonly={action.isReadonly}
				values={action.values}
				onInputChange={action.handleInputChange}
				onSubmit={action.handleSubmit}
				onUpdateField={action.updateField}
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
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onUpdateField: (
		field: keyof WorkspaceCompanyBranchFormValues,
		value: boolean | string,
	) => void;
}) {
	const isSatellite = values.branchType === "Satellite";

	return (
		<form id={CompanyBranchFormId} onSubmit={onSubmit}>
			<div className="rounded-lg border border-darknavy/10 bg-white p-4 shadow-sm sm:p-5">
				<div className="grid gap-4 lg:grid-cols-2">
					<BranchField
						label="Classification"
						required
						className="lg:col-span-2"
					>
						<div className="grid grid-cols-2 gap-2">
							<ClassificationButton
								active={values.branchType === "Branch"}
								disabled={isReadonly}
								icon={Building2}
								label="Branch"
								onClick={() => onUpdateField("branchType", "Branch")}
							/>
							<ClassificationButton
								active={values.branchType === "Satellite"}
								disabled={isReadonly}
								icon={GitBranch}
								label="Satellite"
								onClick={() => onUpdateField("branchType", "Satellite")}
							/>
						</div>
					</BranchField>

					<BranchField label="Name" error={errors.name} required>
						<input
							name="name"
							value={values.name}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceBranchFieldClassName}
							placeholder="Cebu Branch"
						/>
					</BranchField>

					<BranchField label="Contact No." error={errors.contactNumber}>
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
							className={WorkspaceBranchFieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</BranchField>

					<BranchField label="Email" error={errors.email}>
						<input
							name="email"
							type="email"
							value={values.email}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceBranchFieldClassName}
							placeholder="branch@company.com"
						/>
					</BranchField>

					{isSatellite ? null : (
						<BranchField label="TIN" error={errors.tin} required>
							<input
								name="tin"
								value={values.tin}
								onChange={onInputChange}
								readOnly={isReadonly}
								inputMode="numeric"
								maxLength={15}
								className={WorkspaceBranchFieldClassName}
								placeholder="000-000-000-000"
							/>
						</BranchField>
					)}

					<BranchField label="Address">
						<input
							name="address"
							value={values.address}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceBranchFieldClassName}
							placeholder="Street, city, province"
						/>
					</BranchField>

					<BranchField label="Description" className="lg:col-span-2">
						<textarea
							name="description"
							value={values.description}
							onChange={onInputChange}
							readOnly={isReadonly}
							rows={4}
							className={WorkspaceBranchFieldClassName}
							placeholder="Optional notes for this branch or satellite."
						/>
					</BranchField>
				</div>
			</div>
		</form>
	);
}

function BranchField({
	children,
	className,
	error,
	label,
	required,
}: {
	children: ReactNode;
	className?: string;
	error?: string;
	label: string;
	required?: boolean;
}) {
	return (
		<label className={className}>
			<span className="mb-2 block text-sm font-semibold text-darknavy">
				{label}
				{required ? <span className="text-coralpink"> *</span> : null}
			</span>
			{children}
			{error ? (
				<span className="mt-1 block text-xs font-medium text-coralpink">
					{error}
				</span>
			) : null}
		</label>
	);
}

function ClassificationButton({
	active,
	disabled,
	icon: Icon,
	label,
	onClick,
}: {
	active: boolean;
	disabled?: boolean;
	icon: LucideIcon;
	label: WorkspaceCompanyBranchKind;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className={`flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35 disabled:cursor-not-allowed disabled:opacity-70 ${
				active
					? "border-skyblue bg-skyblue/10 text-darknavy"
					: "border-darknavy/10 text-darknavy/65 hover:border-skyblue/50"
			}`}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{label}
		</button>
	);
}

const WorkspaceBranchFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";
