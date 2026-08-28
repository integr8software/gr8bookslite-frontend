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
	getBranchScopedRolesHref,
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
	onUpdateBranchRole,
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
	onUpdateBranchRole?: (
		companyId: string,
		branchId: string,
		companyRoleId: string | null,
	) => void;
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
			description="Manage which companies, head office, branches, and satellites this user can access with specific roles."
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
						className="h-11 w-full rounded-lg border border-darknavy/10 bg-white px-3.5 text-sm font-semibold text-darknavy shadow-sm transition focus:border-skyblue focus:outline-none focus:ring-4 focus:ring-skyblue/15 disabled:cursor-not-allowed disabled:bg-darknavy/5 disabled:text-darknavy/40"
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
				<p className="mt-2 text-sm font-medium text-coralpink">
					{errors.companyAssignments}
				</p>
			) : null}

			<div className="mt-5 grid gap-4">
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
							className="workspace-user-assignment-card rounded-xl border border-darknavy/15 bg-white p-5 shadow-sm"
						>
							<div className="flex flex-wrap items-center justify-between gap-3 border-b border-darknavy/10 pb-4">
								<div>
									<h3 className="text-base font-bold text-darknavy">
										{company?.name ?? "Company"}
									</h3>
									<p className="mt-1 text-xs font-medium text-darknavy/60">
										{assignment.branchIds.length} branch{assignment.branchIds.length === 1 ? "" : "es"} selected
									</p>
								</div>
								{!isReadonly ? (
									<button
										type="button"
										onClick={() =>
											onRemoveCompany(assignment.companyId)
										}
										className="rounded-lg border border-coralpink/20 px-3.5 py-1.5 text-xs font-semibold text-coralpink transition hover:bg-coralpink/10"
									>
										Remove Company
									</button>
								) : null}
							</div>

							<div className="mt-4 space-y-3">
								{companyBranches.length === 0 ? (
									<div className="rounded-lg border border-dashed border-darknavy/20 p-4 text-center text-sm font-medium text-darknavy/50">
										No active branches or satellites available for this company.
									</div>
								) : null}

								{companyBranches.map((branch) => {
									const branchCheckboxId = `workspace-user-${assignment.companyId}-${branch.id}`;
									const branchDisplayName =
										getBranchDisplayName(branch);
									const isBranchSelected =
										assignment.branchIds.includes(branch.id);

									const branchRoles =
										company?.roles?.filter(
											(r) =>
												String(r.unitId) ===
													String(branch.id) ||
												!r.unitId,
										) ?? [];

									const selectedRoleId =
										assignment.branchRoles?.[branch.id] ??
										assignment.branches?.find(
											(b) => b.id === branch.id,
										)?.companyRoleId ??
										"";

									const selectedRoleName =
										branchRoles.find(
											(r) => r.id === selectedRoleId,
										)?.name ??
										assignment.branches?.find(
											(b) => b.id === branch.id,
										)?.companyRoleName;

									return (
										<div
											key={branch.id}
											className={`rounded-xl border transition-all ${
												isBranchSelected
													? "border-skyblue/50 bg-skyblue/[0.02] shadow-sm"
													: "border-darknavy/10 bg-white hover:border-darknavy/20"
											} p-4`}
										>
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													<input
														id={branchCheckboxId}
														type="checkbox"
														checked={isBranchSelected}
														onChange={() =>
															onToggleBranch(
																assignment.companyId,
																branch.id,
															)
														}
														disabled={isReadonly}
														className="h-5 w-5 rounded border-darknavy/25 text-skyblue focus:ring-skyblue/25 disabled:cursor-not-allowed"
													/>
													<label
														htmlFor={branchCheckboxId}
														className="cursor-pointer text-sm font-bold text-darknavy"
													>
														{branchDisplayName}
													</label>
													<span
														className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
															branch.branchType === "Head Office"
																? "bg-citron/30 text-darknavy"
																: branch.branchType === "Branch"
																	? "bg-skyblue/12 text-darknavy"
																	: "bg-coralpink/12 text-coralpink"
														}`}
													>
														{branch.branchType}
													</span>
												</div>

												<div className="flex shrink-0 items-center gap-2">
													<Link
														href={getBranchScopedUsersHref({
															branch,
															company,
															companyId:
																assignment.companyId,
														})}
														onClick={handleBranchUsersClick}
														aria-label={`Open user management for ${branchDisplayName}`}
														className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:border-skyblue/30 hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
													>
														<ExternalLink
															className="h-3.5 w-3.5"
															aria-hidden="true"
														/>
														Users
													</Link>
													<Link
														href={getBranchScopedRolesHref({
															branch,
															company,
															companyId:
																assignment.companyId,
														})}
														onClick={handleBranchUsersClick}
														aria-label={`Open user role management for ${branchDisplayName}`}
														className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-darknavy/10 bg-white px-3 text-xs font-semibold text-darknavy/70 transition hover:border-skyblue/30 hover:bg-skyblue/10 hover:text-skyblue focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-skyblue/15"
													>
														<ExternalLink
															className="h-3.5 w-3.5"
															aria-hidden="true"
														/>
														Roles
													</Link>
												</div>
											</div>

											{isBranchSelected ? (
												<div className="mt-3.5 border-t border-darknavy/8 pt-3.5">
													{isReadonly ? (
														<div className="flex items-center gap-2">
															<Shield
																className="h-4 w-4 text-darknavy/50"
																aria-hidden="true"
															/>
															<span className="text-xs font-semibold text-darknavy/70">
																Assigned Role:
															</span>
															<span className="inline-flex rounded-md bg-skyblue/15 px-3 py-1 text-xs font-bold text-darknavy">
																{selectedRoleName ?? "No Role Assigned"}
															</span>
														</div>
													) : (
														<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
															<div className="flex flex-wrap items-center gap-3">
																<div className="flex items-center gap-2">
																	<Shield
																		className="h-4 w-4 text-darknavy/60"
																		aria-hidden="true"
																	/>
																	<label
																		htmlFor={`branch-role-${branch.id}`}
																		className="text-xs font-bold text-darknavy/80"
																	>
																		Branch Role <span className="text-coralpink">*</span>:
																	</label>
																</div>

																<select
																	id={`branch-role-${branch.id}`}
																	required
																	value={selectedRoleId}
																	onChange={(e) =>
																		onUpdateBranchRole?.(
																			assignment.companyId,
																			branch.id,
																			e.target.value || null,
																		)
																	}
																	className="h-10 w-full rounded-lg border border-darknavy/15 bg-white px-3.5 text-sm font-medium text-darknavy shadow-sm transition focus:border-skyblue focus:outline-none focus:ring-2 focus:ring-skyblue/20 sm:w-64"
																>
																	<option value="" disabled>
																		{branchRoles.length > 0
																			? "Select Role for this branch"
																			: "No roles available"}
																	</option>
																	{branchRoles.map((role) => (
																		<option key={role.id} value={role.id}>
																			{role.name}
																		</option>
																	))}
																</select>
															</div>

															{branchRoles.length === 0 ? (
																<p className="text-xs font-medium text-darknavy/60">
																	No roles in this branch.{" "}
																	<Link
																		href={getBranchScopedRolesHref({
																			branch,
																			company,
																			companyId: assignment.companyId,
																		})}
																		onClick={handleBranchUsersClick}
																		className="font-semibold text-skyblue underline transition hover:text-skyblue/80"
																	>
																		Create role in System Administration
																	</Link>
																</p>
															) : null}
														</div>
													)}
												</div>
											) : null}
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
