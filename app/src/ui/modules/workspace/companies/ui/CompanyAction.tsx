"use client";

import { Building2 } from "lucide-react";
import {
	WorkspaceCompanyPlanOptions,
	WorkspaceCompanyStatusOptions,
	WorkspaceCompanyTypeOptions,
	WorkspaceCompaniesHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { useWorkspaceCompanyAction } from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyAction";
import type {
	WorkspaceCompanyFormErrors,
	WorkspaceCompanyFormValues,
} from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import {
	DefaultPhilippineContactNumber,
	PhilippineContactNumberPlaceholder,
} from "@/app/src/data/shared/ContactData";
import { WorkspaceCompanyActionHeader } from "./WorkspaceCompanyActionHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "./WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";

const CompanyFormId = "workspace-company-form";

export function WorkspaceCompanyAction() {
	const action = useWorkspaceCompanyAction();

	if (action.needsRecord && !action.existingCompany) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<WorkspaceCompanyActionHeader
				cancelHref={action.cancelHref}
				description={
					action.mode === "edit"
						? "Update company identity, subscription plan, and workspace availability."
						: "Create a company profile before adding company users and branches."
				}
				eyebrowIcon={Building2}
				eyebrowLabel="Workspace directory"
				formId={CompanyFormId}
				isReadonly={false}
				mode={action.mode}
				saveLabel="Save Company"
				title={action.mode === "edit" ? "Edit Company" : "Add Company"}
			/>
			<CompanyDetailsFields
				errors={action.errors}
				values={action.values}
				onInputChange={action.handleInputChange}
				onSubmit={action.handleSubmit}
				onUpdateField={action.updateField}
			/>
		</section>
	);
}

function CompanyDetailsFields({
	errors,
	values,
	onInputChange,
	onSubmit,
	onUpdateField,
}: {
	errors: WorkspaceCompanyFormErrors;
	values: WorkspaceCompanyFormValues;
	onInputChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	onUpdateField: (field: keyof WorkspaceCompanyFormValues, value: string) => void;
}) {
	return (
		<form id={CompanyFormId} onSubmit={onSubmit}>
			<input type="submit" hidden />
			<WorkspaceCompanySection
				title="Company Details"
				description="These details appear in the workspace company list and company switcher surfaces."
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField
						label="Company Name"
						error={errors.name}
						required
					>
						<input
							name="name"
							value={values.name}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField
						label="Primary Contact"
						error={errors.primaryContact}
						required
					>
						<input
							name="primaryContact"
							value={values.primaryContact}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						/>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Company Type">
						<select
							name="companyType"
							value={values.companyType}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						>
							{WorkspaceCompanyTypeOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Plan">
						<select
							name="plan"
							value={values.plan}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						>
							{WorkspaceCompanyPlanOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Status">
						<select
							name="status"
							value={values.status}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
						>
							{WorkspaceCompanyStatusOptions.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</WorkspaceCompanyField>
					<WorkspaceCompanyField label="Logo URL">
						<input
							name="logoUrl"
							value={values.logoUrl}
							onChange={onInputChange}
							className={WorkspaceCompanyFieldClassName}
							placeholder="/img/company-background.jpg"
						/>
					</WorkspaceCompanyField>
				</div>
			</WorkspaceCompanySection>

			<WorkspaceCompanySection
				title="Contact"
				description="Workspace admins use these fields to identify the company owner and billing contact."
				className="mt-5"
			>
				<div className="grid gap-4 lg:grid-cols-2">
					<WorkspaceCompanyField label="Email" error={errors.email} required>
						<input
							name="email"
							type="email"
							value={values.email}
							onChange={onInputChange}
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
							className={WorkspaceCompanyFieldClassName}
							placeholder={PhilippineContactNumberPlaceholder}
						/>
					</WorkspaceCompanyField>
					<div className="lg:col-span-2">
						<WorkspaceCompanyField
							label="Address"
							error={errors.address}
							required
						>
							<input
								name="address"
								value={values.address}
								onChange={onInputChange}
								className={WorkspaceCompanyFieldClassName}
							/>
						</WorkspaceCompanyField>
					</div>
				</div>
			</WorkspaceCompanySection>
		</form>
	);
}
