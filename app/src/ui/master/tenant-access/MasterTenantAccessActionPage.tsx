"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Edit3, Save, X } from "lucide-react";
import {
	MasterTenantAccessBranchTypeOptions,
	MasterTenantAccessEntityLabels,
	MasterTenantAccessPlanOptions,
	MasterTenantAccessStatusOptions,
	MasterTenantAccessUserRoleOptions,
	getMasterTenantAccessEditHref,
} from "@/app/src/constants/master/tenant-access/MasterTenantAccessConstants";
import {
	getMasterTenantAccessCompanyName,
	getMasterTenantAccessSubscriberName,
} from "@/app/src/data/master/tenant-access/MasterTenantAccessData";
import { useMasterTenantAccessFormPage } from "@/app/src/hooks/master/tenant-access/useMasterTenantAccessFormPage";
import type {
	MasterBranchFormValues,
	MasterCompanyFormValues,
	MasterSubscriberFormValues,
	MasterTenantAccessActionMode,
	MasterTenantAccessBranchType,
	MasterTenantAccessEntity,
	MasterTenantAccessStatus,
	MasterTenantAccessUserRole,
	MasterUserFormValues,
} from "@/app/src/types/master/tenant-access/MasterTenantAccessTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import { joinClasses } from "@/app/src/ui/shared/module/module-table/utils";

type MasterTenantAccessActionPageProps = {
	entity: MasterTenantAccessEntity;
	mode: MasterTenantAccessActionMode;
	recordId?: string;
	returnSource?: "list" | "view";
};

const ControlClassName =
	"h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition placeholder:text-darknavy/35 focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-offwhite disabled:text-darknavy/40";
const FieldLabelClassName = "grid gap-1.5 text-sm font-semibold text-darknavy/60";

export function MasterTenantAccessActionPage({
	entity,
	mode,
	recordId,
	returnSource,
}: MasterTenantAccessActionPageProps) {
	const page = useMasterTenantAccessFormPage({
		entity,
		mode,
		recordId,
		returnSource,
	});
	const labels = MasterTenantAccessEntityLabels[entity];

	if (page.isMissingRecord) {
		return (
			<ModuleNotFound
				actionHref={page.listHref}
				actionLabel={`Back to ${labels.header}`}
				description={`The selected ${labels.recordLabel} is not available in Master records.`}
				title={`${createTitleLabel(labels.recordLabel)} Not Found`}
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="card"
				titleAs="h1"
				eyebrow={labels.listEyebrow}
				title={createPageTitle(mode, labels.recordLabel)}
				description={labels.description}
				actions={
					<>
						<Link
							href={page.backHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							{mode === "view" ? (
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							) : (
								<X className="h-4 w-4" aria-hidden="true" />
							)}
							{mode === "view" ? "Back" : "Cancel"}
						</Link>
						{mode === "view" && recordId ? (
							<Link
								href={`${getMasterTenantAccessEditHref(entity, recordId)}?from=view`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{mode !== "view" ? (
							<button
								type="button"
								onClick={page.saveRecord}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								{labels.saveLabel}
							</button>
						) : null}
					</>
				}
			/>
			<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
				<div className="grid gap-6 p-5">
					{entity === "subscriber" ? (
						<SubscriberForm page={page} />
					) : null}
					{entity === "company" ? <CompanyForm page={page} /> : null}
					{entity === "branch" ? <BranchForm page={page} /> : null}
					{entity === "user" ? <UserForm page={page} /> : null}
				</div>
				{mode !== "view" ? (
					<div className="flex justify-end border-t border-darknavy/10 bg-offwhite/45 px-5 py-4">
						<button
							type="button"
							onClick={page.saveRecord}
							className={moduleHeaderActionClassNames.primary}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							{labels.saveLabel}
						</button>
					</div>
				) : null}
			</div>
		</section>
	);
}

function SubscriberForm({
	page,
}: {
	page: ReturnType<typeof useMasterTenantAccessFormPage>;
}) {
	const values = page.values as MasterSubscriberFormValues;

	return (
		<>
			<FormSection title="Subscriber">
				<TextField
					error={page.errors.name}
					isReadonly={page.isReadonly}
					label="Subscriber Name"
					value={values.name}
					onChange={(name) => page.updateValues({ name })}
				/>
				<SelectField
					isReadonly={page.isReadonly}
					label="Status"
					options={MasterTenantAccessStatusOptions}
					value={values.status}
					onChange={(status) =>
						page.updateValues({ status: status as MasterTenantAccessStatus })
					}
				/>
				<SelectField
					isReadonly={page.isReadonly}
					label="Plan"
					options={MasterTenantAccessPlanOptions}
					value={values.planName}
					onChange={(planName) => page.updateValues({ planName })}
				/>
				<TextField
					error={page.errors.contactNumber}
					isReadonly={page.isReadonly}
					label="Contact Number"
					value={values.contactNumber}
					onChange={(contactNumber) => page.updateValues({ contactNumber })}
				/>
			</FormSection>
			<FormSection title="Owner">
				<TextField
					error={page.errors.ownerName}
					isReadonly={page.isReadonly}
					label="Owner Name"
					value={values.ownerName}
					onChange={(ownerName) => page.updateValues({ ownerName })}
				/>
				<TextField
					error={page.errors.ownerEmail}
					isReadonly={page.isReadonly}
					label="Owner Email"
					type="email"
					value={values.ownerEmail}
					onChange={(ownerEmail) => page.updateValues({ ownerEmail })}
				/>
			</FormSection>
			<FormSection title="Initial Company">
				<TextField
					error={page.errors.initialCompanyName}
					isReadonly={page.isReadonly}
					label="Company Name"
					value={values.initialCompanyName}
					onChange={(initialCompanyName) =>
						page.updateValues({ initialCompanyName })
					}
				/>
				<TextField
					error={page.errors.initialCompanyTin}
					isReadonly={page.isReadonly}
					label="TIN"
					value={values.initialCompanyTin}
					onChange={(initialCompanyTin) =>
						page.updateValues({ initialCompanyTin })
					}
				/>
				<TextField
					error={page.errors.initialCompanyEmail}
					isReadonly={page.isReadonly}
					label="Company Email"
					type="email"
					value={values.initialCompanyEmail}
					onChange={(initialCompanyEmail) =>
						page.updateValues({ initialCompanyEmail })
					}
				/>
			</FormSection>
			<TextAreaField
				error={page.errors.notes}
				isReadonly={page.isReadonly}
				label="Notes"
				value={values.notes}
				onChange={(notes) => page.updateValues({ notes })}
			/>
		</>
	);
}

function CompanyForm({
	page,
}: {
	page: ReturnType<typeof useMasterTenantAccessFormPage>;
}) {
	const values = page.values as MasterCompanyFormValues;

	return (
		<>
			<FormSection title="Ownership">
				<SelectField
					error={page.errors.subscriberId}
					isReadonly={page.isReadonly}
					label="Subscriber"
					options={page.subscribers.map((subscriber) => ({
						label: subscriber.name,
						value: subscriber.id,
					}))}
					value={values.subscriberId}
					onChange={(subscriberId) => page.updateValues({ subscriberId })}
				/>
				<SelectField
					isReadonly={page.isReadonly}
					label="Status"
					options={MasterTenantAccessStatusOptions}
					value={values.status}
					onChange={(status) =>
						page.updateValues({ status: status as MasterTenantAccessStatus })
					}
				/>
				<SelectField
					isReadonly={page.isReadonly}
					label="Plan"
					options={MasterTenantAccessPlanOptions}
					value={values.planName}
					onChange={(planName) => page.updateValues({ planName })}
				/>
			</FormSection>
			<FormSection title="Company">
				<TextField
					error={page.errors.legalName}
					isReadonly={page.isReadonly}
					label="Legal Name"
					value={values.legalName}
					onChange={(legalName) => page.updateValues({ legalName })}
				/>
				<TextField
					isReadonly={page.isReadonly}
					label="Trade Name"
					value={values.tradeName}
					onChange={(tradeName) => page.updateValues({ tradeName })}
				/>
				<TextField
					error={page.errors.taxId}
					isReadonly={page.isReadonly}
					label="TIN"
					value={values.taxId}
					onChange={(taxId) => page.updateValues({ taxId })}
				/>
				<TextField
					error={page.errors.defaultBranchName}
					isReadonly={page.isReadonly}
					label="Default Branch"
					value={values.defaultBranchName}
					onChange={(defaultBranchName) =>
						page.updateValues({ defaultBranchName })
					}
				/>
			</FormSection>
			<FormSection title="Contact">
				<TextField
					error={page.errors.email}
					isReadonly={page.isReadonly}
					label="Email"
					type="email"
					value={values.email}
					onChange={(email) => page.updateValues({ email })}
				/>
				<TextField
					error={page.errors.contactNumber}
					isReadonly={page.isReadonly}
					label="Contact Number"
					value={values.contactNumber}
					onChange={(contactNumber) => page.updateValues({ contactNumber })}
				/>
			</FormSection>
			<TextAreaField
				error={page.errors.address}
				isReadonly={page.isReadonly}
				label="Address"
				value={values.address}
				onChange={(address) => page.updateValues({ address })}
			/>
		</>
	);
}

function BranchForm({
	page,
}: {
	page: ReturnType<typeof useMasterTenantAccessFormPage>;
}) {
	const values = page.values as MasterBranchFormValues;
	const mainBranchOptions = page.branches.filter(
		(branch) => branch.companyId === values.companyId && branch.isMain,
	);

	return (
		<>
			<FormSection title="Company">
				<SelectField
					error={page.errors.companyId}
					isReadonly={page.isReadonly}
					label="Company"
					options={page.companies.map((company) => ({
						label: `${company.legalName} / ${getMasterTenantAccessSubscriberName(company.subscriberId, page.subscribers)}`,
						value: company.id,
					}))}
					value={values.companyId}
					onChange={(companyId) =>
						page.updateValues({
							companyId,
							linkedMainBranchId: "",
						})
					}
				/>
				<SelectField
					isReadonly={page.isReadonly}
					label="Status"
					options={MasterTenantAccessStatusOptions}
					value={values.status}
					onChange={(status) =>
						page.updateValues({ status: status as MasterTenantAccessStatus })
					}
				/>
			</FormSection>
			<FormSection title="Branch">
				<SelectField
					isReadonly={page.isReadonly}
					label="Type"
					options={MasterTenantAccessBranchTypeOptions}
					value={values.branchType}
					onChange={(branchType) =>
						page.updateValues({
							branchType: branchType as MasterTenantAccessBranchType,
							isMain: branchType === "Head Office",
							linkedMainBranchId:
								branchType === "Satellite" ? values.linkedMainBranchId : "",
						})
					}
				/>
				<TextField
					error={page.errors.name}
					isReadonly={page.isReadonly}
					label="Name"
					value={values.name}
					onChange={(name) => page.updateValues({ name })}
				/>
				<TextField
					error={page.errors.tin}
					isReadonly={page.isReadonly}
					label="TIN"
					value={values.tin}
					onChange={(tin) => page.updateValues({ tin })}
				/>
				<SelectField
					error={page.errors.linkedMainBranchId}
					isReadonly={page.isReadonly || values.branchType !== "Satellite"}
					label="Linked Main Branch"
					options={[
						{ label: "No linked branch", value: "" },
						...mainBranchOptions.map((branch) => ({
							label: branch.name,
							value: branch.id,
						})),
					]}
					value={values.linkedMainBranchId}
					onChange={(linkedMainBranchId) =>
						page.updateValues({ linkedMainBranchId })
					}
				/>
				<CheckboxField
					checked={values.isMain}
					isReadonly={page.isReadonly || values.branchType === "Satellite"}
					label="Main branch"
					onChange={(isMain) => page.updateValues({ isMain })}
				/>
			</FormSection>
			<FormSection title="Contact">
				<TextField
					error={page.errors.email}
					isReadonly={page.isReadonly}
					label="Email"
					type="email"
					value={values.email}
					onChange={(email) => page.updateValues({ email })}
				/>
				<TextField
					error={page.errors.contactNumber}
					isReadonly={page.isReadonly}
					label="Contact Number"
					value={values.contactNumber}
					onChange={(contactNumber) => page.updateValues({ contactNumber })}
				/>
			</FormSection>
			<TextAreaField
				error={page.errors.address}
				isReadonly={page.isReadonly}
				label="Address"
				value={values.address}
				onChange={(address) => page.updateValues({ address })}
			/>
		</>
	);
}

function UserForm({
	page,
}: {
	page: ReturnType<typeof useMasterTenantAccessFormPage>;
}) {
	const values = page.values as MasterUserFormValues;
	const assignedCompanyIds = useMemo(
		() => new Set(values.assignments.map((assignment) => assignment.companyId)),
		[values.assignments],
	);
	const availableCompanies = page.companiesForSelectedSubscriber.filter(
		(company) => !assignedCompanyIds.has(company.id),
	);
	const [selectedCompanyId, setSelectedCompanyId] = useState(
		availableCompanies[0]?.id ?? "",
	);
	const selectedCompany = availableCompanies.some(
		(company) => company.id === selectedCompanyId,
	)
		? selectedCompanyId
		: (availableCompanies[0]?.id ?? "");

	return (
		<>
			<FormSection title="User">
				<SelectField
					error={page.errors.subscriberId}
					isReadonly={page.isReadonly}
					label="Subscriber"
					options={page.subscribers.map((subscriber) => ({
						label: subscriber.name,
						value: subscriber.id,
					}))}
					value={values.subscriberId}
					onChange={(subscriberId) => {
						page.setUserSubscriber(subscriberId);
						setSelectedCompanyId("");
					}}
				/>
				<SelectField
					isReadonly={page.isReadonly}
					label="Status"
					options={MasterTenantAccessStatusOptions}
					value={values.status}
					onChange={(status) =>
						page.updateValues({ status: status as MasterTenantAccessStatus })
					}
				/>
				<TextField
					error={page.errors.name}
					isReadonly={page.isReadonly}
					label="Name"
					value={values.name}
					onChange={(name) => page.updateValues({ name })}
				/>
				<TextField
					error={page.errors.email}
					isReadonly={page.isReadonly}
					label="Email"
					type="email"
					value={values.email}
					onChange={(email) => page.updateValues({ email })}
				/>
				<TextField
					error={page.errors.contactNumber}
					isReadonly={page.isReadonly}
					label="Contact Number"
					value={values.contactNumber}
					onChange={(contactNumber) => page.updateValues({ contactNumber })}
				/>
			</FormSection>
			<div className="grid gap-3">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<SelectField
						isReadonly={page.isReadonly || availableCompanies.length === 0}
						label="Add Company Access"
						options={availableCompanies.map((company) => ({
							label: company.legalName,
							value: company.id,
						}))}
						value={selectedCompany}
						onChange={setSelectedCompanyId}
					/>
					<button
						type="button"
						disabled={page.isReadonly || !selectedCompany}
						onClick={() => {
							page.addUserAssignment(selectedCompany);
							setSelectedCompanyId("");
						}}
						className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-darknavy/10 bg-white px-4 text-sm font-semibold text-darknavy/70 shadow-sm transition hover:bg-skyblue/10 hover:text-darknavy disabled:cursor-not-allowed disabled:opacity-45"
					>
						Add Access
					</button>
				</div>
				<FieldError message={page.errors.assignments} />
				<div className="grid gap-3">
					{values.assignments.map((assignment) => (
						<UserAssignmentPanel
							key={assignment.companyId}
							assignment={assignment}
							isReadonly={page.isReadonly}
							branches={page.branches.filter(
								(branch) => branch.companyId === assignment.companyId,
							)}
							companyName={getMasterTenantAccessCompanyName(
								assignment.companyId,
								page.companies,
							)}
							onRemove={() =>
								page.removeUserAssignment(assignment.companyId)
							}
							onRoleChange={(role) =>
								page.updateUserAssignmentRole(assignment.companyId, role)
							}
							onToggleBranch={(branchId) =>
								page.toggleUserAssignmentBranch(
									assignment.companyId,
									branchId,
								)
							}
						/>
					))}
				</div>
			</div>
		</>
	);
}

function UserAssignmentPanel({
	assignment,
	branches,
	companyName,
	isReadonly,
	onRemove,
	onRoleChange,
	onToggleBranch,
}: {
	assignment: MasterUserFormValues["assignments"][number];
	branches: { id: string; name: string }[];
	companyName: string;
	isReadonly: boolean;
	onRemove: () => void;
	onRoleChange: (role: MasterTenantAccessUserRole) => void;
	onToggleBranch: (branchId: string) => void;
}) {
	return (
		<div className="rounded-lg border border-darknavy/10 bg-offwhite/45 p-4">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-darknavy">{companyName}</p>
					<p className="mt-1 text-xs font-semibold text-darknavy/45">
						{assignment.branchIds.length} branch access
					</p>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
					<SelectField
						isReadonly={isReadonly}
						label="Role"
						options={MasterTenantAccessUserRoleOptions}
						value={assignment.role}
						onChange={(role) =>
							onRoleChange(role as MasterTenantAccessUserRole)
						}
					/>
					<button
						type="button"
						disabled={isReadonly}
						onClick={onRemove}
						className="inline-flex h-11 items-center justify-center rounded-lg border border-coralpink/25 bg-white px-4 text-sm font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-45"
					>
						Remove
					</button>
				</div>
			</div>
			<div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
				{branches.map((branch) => (
					<label
						key={branch.id}
						className="flex min-h-11 items-center gap-2 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70"
					>
						<input
							type="checkbox"
							checked={assignment.branchIds.includes(branch.id)}
							disabled={isReadonly}
							onChange={() => onToggleBranch(branch.id)}
							className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
						/>
						<span className="truncate">{branch.name}</span>
					</label>
				))}
			</div>
		</div>
	);
}

function FormSection({
	children,
	title,
}: {
	children: ReactNode;
	title: string;
}) {
	return (
		<section className="grid gap-4 border-b border-darknavy/10 pb-6 last:border-b-0 last:pb-0">
			<h2 className="text-sm font-semibold uppercase text-darknavy/45">
				{title}
			</h2>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{children}
			</div>
		</section>
	);
}

function TextField({
	error,
	isReadonly,
	label,
	type = "text",
	value,
	onChange,
}: {
	error?: string;
	isReadonly: boolean;
	label: string;
	type?: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<input
				disabled={isReadonly}
				type={type}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={ControlClassName}
			/>
			<FieldError message={error} />
		</label>
	);
}

function TextAreaField({
	error,
	isReadonly,
	label,
	value,
	onChange,
}: {
	error?: string;
	isReadonly: boolean;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<label className={FieldLabelClassName}>
			{label}
			<textarea
				disabled={isReadonly}
				value={value}
				rows={4}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(ControlClassName, "min-h-28 py-3")}
			/>
			<FieldError message={error} />
		</label>
	);
}

function SelectField({
	error,
	isReadonly,
	label,
	options,
	value,
	onChange,
}: {
	error?: string;
	isReadonly: boolean;
	label: string;
	options: readonly (string | { label: string; value: string })[];
	value: string;
	onChange: (value: string) => void;
}) {
	const resolvedOptions = options.map((option) =>
		typeof option === "string" ? { label: option, value: option } : option,
	);

	return (
		<label className={FieldLabelClassName}>
			{label}
			<select
				disabled={isReadonly || resolvedOptions.length === 0}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				className={joinClasses(ControlClassName, "app-select-control")}
			>
				{resolvedOptions.length === 0 ? (
					<option value="">No options</option>
				) : null}
				{resolvedOptions.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
			<FieldError message={error} />
		</label>
	);
}

function CheckboxField({
	checked,
	isReadonly,
	label,
	onChange,
}: {
	checked: boolean;
	isReadonly: boolean;
	label: string;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex min-h-11 items-center gap-3 rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy/70 shadow-sm">
			<input
				type="checkbox"
				checked={checked}
				disabled={isReadonly}
				onChange={(event) => onChange(event.target.checked)}
				className="h-4 w-4 rounded border-darknavy/20 text-skyblue focus:ring-skyblue/20"
			/>
			{label}
		</label>
	);
}

function FieldError({ message }: { message?: string }) {
	if (!message) {
		return null;
	}

	return <span className="text-xs font-semibold text-coralpink">{message}</span>;
}

function createPageTitle(mode: MasterTenantAccessActionMode, recordLabel: string) {
	const titleLabel = createTitleLabel(recordLabel);

	if (mode === "add") {
		return `Add ${titleLabel}`;
	}

	if (mode === "edit") {
		return `Edit ${titleLabel}`;
	}

	return `View ${titleLabel}`;
}

function createTitleLabel(recordLabel: string) {
	return recordLabel
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
