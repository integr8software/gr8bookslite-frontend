"use client";

import { Suspense } from "react";
import { Users } from "lucide-react";
import { WorkspaceCompaniesHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { PhilippineContactNumberPlaceholder } from "@/app/src/data/shared/contact/ContactData";
import { useWorkspaceCompanyUserAction } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyAction";
import type {
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { WorkspaceCompanyActionHeader } from "@/app/src/ui/workspace/companies/WorkspaceCompanyActionHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "@/app/src/ui/workspace/companies/WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "@/app/src/ui/workspace/companies/WorkspaceCompanyNotFound";

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
				title={
					action.mode === "view"
						? "View User"
						: action.mode === "edit"
							? "Edit User"
							: "Add User"
				}
			/>
			<CompanyUserFields
				errors={action.errors}
				isReadonly={action.isReadonly}
				values={action.values}
				onInputChange={action.handleInputChange}
				onSubmit={action.handleSubmit}
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
}: {
	errors: WorkspaceCompanyUserFormErrors;
	isReadonly: boolean;
	values: WorkspaceCompanyUserFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
	return (
		<form id={CompanyUserFormId} onSubmit={onSubmit}>
			<WorkspaceCompanySection
				title="User Details"
				description="Company users can be assigned to branches later with separate branch roles."
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField
						label="Full Name"
						error={errors.name}
						required
					>
						<input
							name="name"
							value={values.name}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField
						label="Email"
						error={errors.email}
						required
					>
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
					>
						<input
							name="contactNumber"
							type="tel"
							inputMode="numeric"
							maxLength={16}
							value={values.contactNumber}
							onChange={onInputChange}
							readOnly={isReadonly}
							className={WorkspaceCompanyFieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</WorkspaceCompanyField>
				</div>
			</WorkspaceCompanySection>
		</form>
	);
}
