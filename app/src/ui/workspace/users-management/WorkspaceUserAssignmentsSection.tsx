"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useState, type MouseEvent } from "react";
import { Building2, ExternalLink, Shield } from "lucide-react";
import type {
	WorkspaceCompanyBranchRecord,
	WorkspaceCompanyRecord,
	WorkspaceCompanyUserFormErrors,
	WorkspaceCompanyUserFormValues,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import {
	WorkspaceManagementFieldClassName,
	WorkspaceManagementSection,
} from "@/app/src/ui/workspace/WorkspaceManagementForm";
import {
	getBranchDisplayName,
	getBranchScopedUsersHref,
} from "@/app/src/ui/workspace/users-management/utils";

const MainLoadingScreen = dynamic(() =>
	import("@/app/src/ui/shared/app/MainLoadingScreen").then(
		(module) => module.MainLoadingScreen,
	),
);

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
	onUpdateCompanyRole,
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
	onUpdateCompanyRole?: (
		companyId: string,
		role: "ADMIN" | "USER",
		companyRoleId?: string | null,
	) => void;
}) {
	const [isOpeningBranchUsers, setIsOpeningBranchUsers] = useState(false);

	function handleBranchUsersClick(event: MouseEvent<HTMLAnchorElement>) {
		if (
			event.defaultPrevented ||
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		setIsOpeningBranchUsers(true);
	}

	return (
		<WorkspaceManagementSection
			title="Company & Branch Access"
			description="Manage which companies, head office, branches, and satellites this user can access."
		>
			{isOpeningBranchUsers ? (
				<div className="fixed inset-0 z-[9999]">
					<MainLoadingScreen message="Opening branch user management..." />
				</div>
			) : null}
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div className="min-w-0 flex-1">
					<label
						htmlFor="workspace-user-company-select"
						className="sr-only"
					>
						Select company
					</label>
					<select
						id="workspace-user-company-select"
						value={selectedCompanyId}
						onChange={(event) =>
							onSelectedCompanyChange(event.target.value)
						}
						disabled={
							isReadonly || availableCompanies.length === 0
						}
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3 text-sm font-semibold text-darknavy shadow-sm transition focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5 disabled:text-darknavy/40"
					>
						{availableCompanies.length === 0 ? (
							<option value="">
								All active companies have been added
							</option>
						) : null}
						{availableCompanies.map((company) => (
							<option key={company.id} value={company.id}>
								{company.name}
							</option>
						))}
					</select>
				</div>
				<button
					type="button"
					onClick={onAddCompany}
					disabled={
						isReadonly || availableCompanies.length === 0
					}
					className="theme-accent-contrast-text inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-skyblue px-4 text-sm font-semibold transition hover:bg-skyblue/85 disabled:cursor-not-allowed disabled:bg-skyblue/35 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skyblue/35"
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
							className="workspace-user-assignment-card rounded-lg border p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-3">
								<div>
									<h3 className="text-sm font-semibold text-darknavy">
										{company?.name ?? "Company"}
									</h3>
									<p className="mt-1 text-xs text-darknavy/50">
										{assignment.branchIds.length} selected
										branch access
									</p>
								</div>
								<button
									type="button"
									onClick={() =>
										onRemoveCompany(assignment.companyId)
									}
									disabled={isReadonly}
									className="rounded-md px-3 py-2 text-xs font-semibold text-coralpink transition hover:bg-coralpink/10 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Remove
								</button>
							</div>

							<div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-darknavy/10 bg-offwhite/50 p-3">
								<div className="flex items-center gap-2">
									<Shield
										className="h-4 w-4 text-darknavy/50"
										aria-hidden="true"
									/>
									<label
										htmlFor={`workspace-user-role-${assignment.companyId}`}
										className="text-xs font-semibold text-darknavy/70"
									>
										Role <span className="text-coralpink">*</span>:
									</label>
								</div>
								{isReadonly ? (
									<span className="inline-flex rounded-md bg-skyblue/10 px-2.5 py-1 text-xs font-semibold text-darknavy">
										{assignment.companyRoleId
											? company?.roles?.find(
													(r) =>
														r.id ===
														assignment.companyRoleId,
												)?.name ?? "Assigned Role"
											: "No Role Assigned"}
									</span>
								) : (
									<select
										id={`workspace-user-role-${assignment.companyId}`}
										required
										value={
											assignment.companyRoleId
												? `custom:${assignment.companyRoleId}`
												: ""
										}
										onChange={(event) => {
											const selectedVal =
												event.target.value;
											if (
												selectedVal.startsWith("custom:")
											) {
												onUpdateCompanyRole?.(
													assignment.companyId,
													"USER",
													selectedVal.replace(
														"custom:",
														"",
													),
												);
											} else {
												onUpdateCompanyRole?.(
													assignment.companyId,
													"USER",
													null,
												);
											}
										}}
										className="h-9 rounded-md border border-darknavy/15 bg-white px-3 text-xs font-medium text-darknavy shadow-sm focus:border-skyblue focus:outline-none focus:ring-2 focus:ring-skyblue/20"
									>
										<option value="" disabled>
											{company?.roles &&
											company.roles.length > 0
												? "Select Role"
												: "No roles available (Create in User Roles first)"}
										</option>
										{company?.roles &&
										company.roles.length > 0
											? company.roles.map((r) => (
													<option
														key={r.id}
														value={`custom:${r.id}`}
													>
														{r.name}
													</option>
												))
											: null}
									</select>
								)}
							</div>




							<div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
								{companyBranches.length === 0 ? (
									<div className="workspace-user-branch-card rounded-md border px-3 py-2 text-sm font-medium text-darknavy/50">
										No active company units available.
									</div>
								) : null}
								{companyBranches.map((branch) => {
									const branchCheckboxId = `workspace-user-${assignment.companyId}-${branch.id}`;
									const branchDisplayName =
										getBranchDisplayName(branch);

									return (
										<div
											key={branch.id}
											className="workspace-user-branch-card flex items-center gap-3 rounded-md border px-3 py-2 text-sm font-medium text-darknavy"
										>
											<input
												id={branchCheckboxId}
												type="checkbox"
												checked={assignment.branchIds.includes(
													branch.id,
												)}
												onChange={() =>
													onToggleBranch(
														assignment.companyId,
														branch.id,
													)
												}
												disabled={isReadonly}
												className="h-4 w-4 rounded border-darknavy/20 text-skyblue"
											/>
											<label
												htmlFor={branchCheckboxId}
												className="min-w-0 flex-1 cursor-pointer truncate"
											>
												{branchDisplayName}
											</label>
											<Link
												href={getBranchScopedUsersHref({
													branch,
													company,
													companyId:
														assignment.companyId,
												})}
												onClick={handleBranchUsersClick}
												aria-label={`Open user management for ${branchDisplayName}`}
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
		</WorkspaceManagementSection>
	);
}
