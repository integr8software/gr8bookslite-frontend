"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
	ArrowLeft,
	Building2,
	Edit3,
	ExternalLink,
	Save,
	UserCog,
	X,
} from "lucide-react";
import { UserListHref } from "@/app/src/constants/modules/user-management/UserManagementConstants";
import {
	WorkspaceUsersManagementHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	InitialWorkspaceCompanyUserFormValues,
	validateWorkspaceCompanyUserForm,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyData";
import { FormatPhilippineContactNumber, PhilippineContactNumberPlaceholder } from "@/app/src/data/shared/contact/ContactData";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyRecord,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	moduleHeaderActionClassNames,
	ModuleHeader,
} from "@/app/src/ui/shared/module/ModuleHeader";
import {
	WorkspaceCompanyField,
	WorkspaceCompanyFieldClassName,
	WorkspaceCompanySection,
} from "@/app/src/ui/workspace/companies/WorkspaceCompanyFormPrimitives";
import { WorkspaceCompanyNotFound } from "@/app/src/ui/workspace/companies/WorkspaceCompanyNotFound";
import { WorkspaceBillingImpactConfirmDialog } from "@/app/src/ui/workspace/shared/WorkspaceBillingImpactConfirmDialog";

const WorkspaceUserFormId = "workspace-user-management-form";
const BranchUsersContextParam = "workspaceBranchId";
const CompanyUsersContextParam = "workspaceCompanyId";
const BranchUsersNameParam = "branchName";
const CompanyUsersNameParam = "companyName";

export function WorkspaceUserAction() {
	return (
		<Suspense fallback={null}>
			<WorkspaceUserActionInner />
		</Suspense>
	);
}

function WorkspaceUserActionInner() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams<{ userId?: string }>();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const addCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.addCompanyUser,
	);
	const updateCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.updateCompanyUser,
	);
	const mode = pathname.includes("/view/")
		? "view"
		: pathname.includes("/edit/")
			? "edit"
			: "add";
	const isReadonly = mode === "view";
	const existingUser = users.find((user) => user.id === params.userId);
	const [values, setValues] = useState<WorkspaceCompanyUserFormValues>(() =>
		existingUser
			? {
					companyAssignments: existingUser.companyAssignments,
					contactNumber: existingUser.contactNumber,
					email: existingUser.email,
					name: existingUser.name,
				}
			: InitialWorkspaceCompanyUserFormValues,
	);
	const [errors, setErrors] = useState<WorkspaceCompanyUserFormErrors>({});
	const [pendingCompanyId, setPendingCompanyId] = useState<string | null>(null);

	const availableCompanies = useMemo(
		() =>
			companies.filter(
				(company) =>
					!values.companyAssignments.some(
						(assignment) => assignment.companyId === company.id,
					),
			),
		[companies, values.companyAssignments],
	);
	const [selectedCompanyId, setSelectedCompanyId] = useState(
		availableCompanies[0]?.id ?? "",
	);

	if (mode !== "add" && !existingUser) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceUsersManagementHref}
				title="User Not Found"
			/>
		);
	}

	function updateField(field: keyof WorkspaceCompanyUserFormValues, value: string) {
		if (isReadonly) return;
		setValues((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: undefined }));
	}

	function addCompanyAssignment() {
		if (isReadonly || !pendingCompanyId) return;
		setValues((current) => ({
			...current,
			companyAssignments: [
				...current.companyAssignments,
				{ companyId: pendingCompanyId, branchIds: [] },
			],
		}));
		setErrors((current) => ({ ...current, companyAssignments: undefined }));
		setSelectedCompanyId(
			availableCompanies.find((company) => company.id !== pendingCompanyId)
				?.id ?? "",
		);
		setPendingCompanyId(null);
	}

	function removeCompanyAssignment(companyId: string) {
		if (isReadonly) return;
		setValues((current) => ({
			...current,
			companyAssignments: current.companyAssignments.filter(
				(assignment) => assignment.companyId !== companyId,
			),
		}));
	}

	function toggleBranchAssignment(companyId: string, branchId: string) {
		if (isReadonly) return;
		setValues((current) => ({
			...current,
			companyAssignments: current.companyAssignments.map((assignment) => {
				if (assignment.companyId !== companyId) return assignment;
				const hasBranch = assignment.branchIds.includes(branchId);
				return {
					...assignment,
					branchIds: hasBranch
						? assignment.branchIds.filter((id) => id !== branchId)
						: [...assignment.branchIds, branchId],
				};
			}),
		}));
	}

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const nextErrors = validateWorkspaceCompanyUserForm(values);

		if (Object.keys(nextErrors).length > 0) {
			setErrors(nextErrors);
			return;
		}

		const primaryCompanyId = values.companyAssignments[0]?.companyId;
		if (!primaryCompanyId) return;

		if (mode === "edit" && existingUser) {
			updateCompanyUser({
				...existingUser,
				companyAssignments: values.companyAssignments,
				contactNumber: values.contactNumber.trim(),
				email: existingUser.email,
				name: values.name.trim(),
			});
			router.push(WorkspaceUsersManagementHref);
			return;
		}

		addCompanyUser({
			companyAssignments: values.companyAssignments,
			companyId: primaryCompanyId,
			contactNumber: values.contactNumber.trim(),
			email: values.email.trim(),
			id: `cu-${Date.now()}`,
			lastLogin: "Invitation sent",
			name: values.name.trim(),
			status: "Pending",
		});
		router.push(WorkspaceUsersManagementHref);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={
					mode === "view" ? "View User" : mode === "edit" ? "Edit User" : "Add User"
				}
				description="Create a workspace user once, then assign access to multiple companies and their branches or satellites."
				eyebrow={
					<>
						<UserCog className="h-3.5 w-3.5" aria-hidden="true" />
						Users Management
					</>
				}
				actions={
					<>
						<Link
							href={WorkspaceUsersManagementHref}
							className={moduleHeaderActionClassNames.secondary}
						>
							{mode === "view" ? (
								<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							) : (
								<X className="h-4 w-4" aria-hidden="true" />
							)}
							{mode === "view" ? "Back" : "Cancel"}
						</Link>
						{mode === "view" && existingUser ? (
							<Link
								href={`${WorkspaceUsersManagementHref}/edit/${existingUser.id}`}
								className={moduleHeaderActionClassNames.secondary}
							>
								<Edit3 className="h-4 w-4" aria-hidden="true" />
								Edit
							</Link>
						) : null}
						{!isReadonly ? (
							<button
								type="submit"
								form={WorkspaceUserFormId}
								className={moduleHeaderActionClassNames.primary}
							>
								<Save className="h-4 w-4" aria-hidden="true" />
								Save User
							</button>
						) : null}
					</>
				}
			/>
			<form id={WorkspaceUserFormId} onSubmit={handleSubmit}>
				<div className="grid gap-5">
					<UserDetailsSection
						errors={errors}
						isEmailReadonly={mode !== "add"}
						isReadonly={isReadonly}
						values={values}
						onUpdateField={updateField}
					/>
					<UserAssignmentsSection
						availableCompanies={availableCompanies}
						branches={branches}
						companies={companies}
						errors={errors}
						isReadonly={isReadonly}
						selectedCompanyId={selectedCompanyId}
						values={values}
						onAddCompany={() => setPendingCompanyId(selectedCompanyId)}
						onRemoveCompany={removeCompanyAssignment}
						onSelectedCompanyChange={setSelectedCompanyId}
						onToggleBranch={toggleBranchAssignment}
					/>
				</div>
			</form>
			<WorkspaceBillingImpactConfirmDialog
				isOpen={Boolean(pendingCompanyId)}
				title="Add company access?"
				description="Adding this user to another company may affect billing, including user access costs, payments, or deductions. Confirm before adding the company assignment."
				resourceName={
					companies.find((company) => company.id === pendingCompanyId)?.name ??
					"this company"
				}
				onCancel={() => setPendingCompanyId(null)}
				onConfirm={addCompanyAssignment}
			/>
		</section>
	);
}

function UserDetailsSection({
	errors,
	isEmailReadonly,
	isReadonly,
	values,
	onUpdateField,
}: {
	errors: WorkspaceCompanyUserFormErrors;
	isEmailReadonly: boolean;
	isReadonly: boolean;
	values: WorkspaceCompanyUserFormValues;
	onUpdateField: (field: keyof WorkspaceCompanyUserFormValues, value: string) => void;
}) {
	return (
		<WorkspaceCompanySection
			title="User Details"
			description="Admins can update the user's name and contact number. Email stays readonly after creation."
		>
			<div className="grid gap-4 lg:grid-cols-2">
				<WorkspaceCompanyField label="Full Name" error={errors.name} required>
					<input
						value={values.name}
						onChange={(event) => onUpdateField("name", event.target.value)}
						readOnly={isReadonly}
						className={WorkspaceCompanyFieldClassName}
					/>
				</WorkspaceCompanyField>
				<WorkspaceCompanyField label="Email" error={errors.email} required>
					<input
						type="email"
						value={values.email}
						onChange={(event) => onUpdateField("email", event.target.value)}
						readOnly={isReadonly || isEmailReadonly}
						className={WorkspaceCompanyFieldClassName}
					/>
				</WorkspaceCompanyField>
				<WorkspaceCompanyField label="Contact No." error={errors.contactNumber}>
					<input
						type="tel"
						inputMode="numeric"
						maxLength={16}
						value={values.contactNumber}
						onChange={(event) =>
							onUpdateField(
								"contactNumber",
								FormatPhilippineContactNumber(event.target.value),
							)
						}
						readOnly={isReadonly}
						className={WorkspaceCompanyFieldClassName}
						placeholder={PhilippineContactNumberPlaceholder}
					/>
				</WorkspaceCompanyField>
			</div>
		</WorkspaceCompanySection>
	);
}

function UserAssignmentsSection({
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
												<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
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

function getBranchScopedUsersHref({
	branch,
	company,
	companyId,
}: {
	branch: WorkspaceCompanyBranchRecord;
	company?: WorkspaceCompanyRecord;
	companyId: string;
}) {
	const params = new URLSearchParams({
		[BranchUsersContextParam]: branch.id,
		[BranchUsersNameParam]: getBranchDisplayName(branch),
		[CompanyUsersContextParam]: company?.id ?? companyId,
		[CompanyUsersNameParam]: company?.name ?? "Company",
	});

	return `${UserListHref}?${params.toString()}`;
}

function getBranchDisplayName(branch: WorkspaceCompanyBranchRecord) {
	return `${branch.name}${branch.isMain ? " (Head Office)" : ""}`;
}
