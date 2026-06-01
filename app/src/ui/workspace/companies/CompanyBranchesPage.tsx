"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, GitBranch, Search } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	WorkspaceCompanyNotFoundDescription,
	getWorkspaceCompanyHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { WorkspaceCompanyBranchFormId } from "@/app/src/data/workspace/companies/WorkspaceCompanyBranchData";
import { getBranchDisplayLabel } from "@/app/src/data/shared/branch/BranchDisplayData";
import { useWorkspaceCompanyBranchesPage } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyBranchesPage";
import type { WorkspaceCompanyBranchRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { AppDialog } from "@/app/src/ui/shared/app/AppDialog";
import { AppSkeleton } from "@/app/src/ui/shared/app/AppSkeleton";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { ModuleNotFound } from "@/app/src/ui/shared/module/ModuleNotFound";
import {
	ModuleTableActionButton,
	ModuleTableActions,
} from "@/app/src/ui/shared/module/module-table/ModuleTableActions";
import { BranchDetailsFields } from "@/app/src/ui/modules/system-administration/branch-management/BranchDetailsFields";
import {
	WorkspaceManagementStatusBadge,
	WorkspaceManagementSummaryBadge,
} from "@/app/src/ui/workspace/WorkspaceManagementBadges";

export function CompanyBranchesPage() {
	const branchPage = useWorkspaceCompanyBranchesPage();
	const drawerTitle =
		branchPage.drawerMode === "edit" ? "Edit Branch" : "View Branch";
	const isDrawerReadonly =
		branchPage.drawerMode === "view" || branchPage.isUpdatingBranch;

	if (!branchPage.company && !branchPage.isLoading) {
		return (
			<ModuleNotFound
				actionHref={WorkspaceCompaniesHref}
				actionLabel="Back"
				align="center"
				description={WorkspaceCompanyNotFoundDescription}
				title="Company Not Found"
			/>
		);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={branchPage.company?.name ?? "Company Branches"}
				description="View, edit, and deactivate company branches and satellite offices."
				eyebrow={
					<>
						<GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
						Company branches
					</>
				}
				actions={
					branchPage.company ? (
						<Link
							href={getWorkspaceCompanyHref(
								branchPage.company.id,
							)}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Back to Company
						</Link>
					) : null
				}
			/>
			<CompanyBranchesTable
				branches={branchPage.branches}
				isLoading={branchPage.isLoading}
				onDeactivate={branchPage.setPendingInactiveBranch}
				onEdit={(branch) => branchPage.openBranchDrawer("edit", branch)}
				onView={(branch) => branchPage.openBranchDrawer("view", branch)}
			/>
			<ModuleDrawer
				isOpen={Boolean(branchPage.drawerMode)}
				title={drawerTitle}
				description={
					branchPage.selectedBranch
						? branchPage.selectedBranch.name
						: "Review this branch record."
				}
				eyebrow="Branch management"
				maxWidthClassName="max-w-3xl"
				onClose={branchPage.closeBranchDrawer}
				footer={
					branchPage.drawerMode === "edit" ? (
						<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<button
								type="button"
								onClick={branchPage.closeBranchDrawer}
								disabled={branchPage.isUpdatingBranch}
								className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								Cancel
							</button>
							<button
								type="submit"
								form={WorkspaceCompanyBranchFormId}
								disabled={branchPage.isUpdatingBranch}
								className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
							>
								Save Branch
							</button>
						</div>
					) : null
				}
			>
				{branchPage.selectedBranchValues ? (
					<form
						id={WorkspaceCompanyBranchFormId}
						onSubmit={branchPage.handleUpdateBranch}
						className="px-6 py-5"
					>
						<BranchDetailsFields
							errors={branchPage.branchErrors}
							hideMainBranchField
							hideSatelliteTaxField
							isReadonly={isDrawerReadonly}
							mainBranchOptions={branchPage.mainBranchOptions}
							values={branchPage.selectedBranchValues}
							onInputChange={branchPage.handleBranchInputChange}
							onUpdateField={branchPage.updateBranchField}
						/>
					</form>
				) : null}
			</ModuleDrawer>
			<AppDialog
				isOpen={Boolean(branchPage.pendingInactiveBranch)}
				isPending={branchPage.isDeactivatingBranch}
				title="Deactivate branch?"
				description={`This will mark ${
					branchPage.pendingInactiveBranch?.name ??
					"the selected branch"
				} as inactive while keeping its history available.`}
				confirmLabel="Deactivate Branch"
				tone="danger"
				onCancel={() => branchPage.setPendingInactiveBranch(null)}
				onConfirm={branchPage.confirmDeactivateBranch}
			/>
		</section>
	);
}

function CompanyBranchesTable({
	branches,
	isLoading,
	onDeactivate,
	onEdit,
	onView,
}: {
	branches: WorkspaceCompanyBranchRecord[];
	isLoading: boolean;
	onDeactivate: (branch: WorkspaceCompanyBranchRecord) => void;
	onEdit: (branch: WorkspaceCompanyBranchRecord) => void;
	onView: (branch: WorkspaceCompanyBranchRecord) => void;
}) {
	if (isLoading) {
		return (
			<div className="rounded-lg border border-darknavy/10 bg-white p-5 shadow-sm">
				<div className="grid gap-3">
					<AppSkeleton className="h-12 rounded-md" />
					<AppSkeleton className="h-12 rounded-md" />
					<AppSkeleton className="h-12 rounded-md" />
				</div>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-lg border border-darknavy/10 bg-white shadow-sm">
			<div className="grid grid-cols-[1.25fr_0.65fr_0.75fr_0.7fr_0.7fr_8rem] gap-4 border-b border-darknavy/10 bg-darknavy/[0.03] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-darknavy/50 max-lg:hidden">
				<span>Name</span>
				<span>Type</span>
				<span>TIN</span>
				<span>Status</span>
				<span>Contact</span>
				<span className="text-right">Actions</span>
			</div>
			<div className="divide-y divide-darknavy/10">
				{branches.length > 0 ? (
					branches.map((branch) => (
						<CompanyBranchTableRow
							key={branch.id}
							branch={branch}
							onDeactivate={onDeactivate}
							onEdit={onEdit}
							onView={onView}
						/>
					))
				) : (
					<div className="flex items-center gap-3 px-4 py-6 text-sm font-medium text-darknavy/55">
						<Search className="h-5 w-5" aria-hidden="true" />
						No branch records yet.
					</div>
				)}
			</div>
		</div>
	);
}

function CompanyBranchTableRow({
	branch,
	onDeactivate,
	onEdit,
	onView,
}: {
	branch: WorkspaceCompanyBranchRecord;
	onDeactivate: (branch: WorkspaceCompanyBranchRecord) => void;
	onEdit: (branch: WorkspaceCompanyBranchRecord) => void;
	onView: (branch: WorkspaceCompanyBranchRecord) => void;
}) {
	const Icon = branch.branchType === "Satellite" ? GitBranch : Building2;
	const branchDisplayName = getBranchDisplayLabel(branch);
	const branchTypeLabel = branch.isMain ? "Head Office" : branch.branchType;

	return (
		<article className="grid gap-3 px-4 py-4 lg:grid-cols-[1.25fr_0.65fr_0.75fr_0.7fr_0.7fr_8rem] lg:items-center lg:gap-4">
			<div className="flex min-w-0 items-start gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<h3 className="truncate text-sm font-semibold text-darknavy">
						{branchDisplayName}
					</h3>
					<p className="mt-1 truncate text-xs text-darknavy/50">
						{branch.address || "No address set"}
					</p>
				</div>
			</div>
			<BranchTableDetail label="Type">
				<WorkspaceManagementSummaryBadge>
					{branchTypeLabel}
				</WorkspaceManagementSummaryBadge>
			</BranchTableDetail>
			<BranchTableDetail label="TIN">
				{branch.tin || "-"}
			</BranchTableDetail>
			<BranchTableDetail label="Status">
				<WorkspaceManagementStatusBadge status={branch.status} />
			</BranchTableDetail>
			<BranchTableDetail label="Contact">
				{branch.contactNumber || branch.email || "-"}
			</BranchTableDetail>
			<ModuleTableActions className="justify-start lg:justify-end">
				<ModuleTableActionButton
					variant="view"
					onClick={() => onView(branch)}
					label={`View ${branchDisplayName}`}
				/>
				<ModuleTableActionButton
					variant="edit"
					onClick={() => onEdit(branch)}
					label={`Edit ${branchDisplayName}`}
				/>
				<ModuleTableActionButton
					variant="inactive"
					onClick={() => onDeactivate(branch)}
					disabled={branch.status === "Inactive"}
					label={`Deactivate ${branchDisplayName}`}
				/>
			</ModuleTableActions>
		</article>
	);
}

function BranchTableDetail({
	children,
	label,
}: {
	children: ReactNode;
	label: string;
}) {
	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/40 lg:hidden">
				{label}
			</p>
			<div className="mt-1 truncate text-sm font-medium text-darknavy lg:mt-0">
				{children}
			</div>
		</div>
	);
}
