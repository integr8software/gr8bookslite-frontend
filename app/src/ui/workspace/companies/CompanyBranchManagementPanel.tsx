"use client";

import Link from "next/link";
import { Building2, GitBranch, Plus, Save, X } from "lucide-react";
import {
	getWorkspaceCompanyBranchesHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import {
	WorkspaceCompanyBranchFormId,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyBranchData";
import {
	getBranchDisplayLabel,
} from "@/app/src/data/shared/branch/BranchDisplayData";
import {
	useWorkspaceCompanyBranchManagementPanel,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyBranchManagementPanel";
import type {
	WorkspaceCompanyBranchManagementPanelProps,
} from "@/app/src/types/workspace/WorkspaceCompanyBranchTypes";
import type {
	WorkspaceCompanyBranchRecord,
} from "@/app/src/types/workspace/WorkspaceCompanyTypes";
import { ModuleDrawer } from "@/app/src/ui/shared/module/ModuleDrawer";
import { moduleHeaderActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { BranchDetailsFields } from "@/app/src/ui/modules/system-administration/branch-management/BranchDetailsFields";

export function CompanyBranchManagementPanel({
	cachedBranches,
	company,
	userCount,
}: WorkspaceCompanyBranchManagementPanelProps) {
	const branchManagement = useWorkspaceCompanyBranchManagementPanel({
		cachedBranches,
		company,
		userCount,
	});

	return (
		<>
			<BranchSummaryCard
				branchCount={branchManagement.branchCount}
				branches={branchManagement.branches}
				companyId={company.id}
				isAddBranchOpen={branchManagement.isAddBranchOpen}
				isLoading={branchManagement.isLoadingBranches}
				userCount={userCount}
				onAddBranch={branchManagement.openAddBranchDrawer}
			/>
			<ModuleDrawer
				isOpen={branchManagement.isAddBranchOpen}
				title="Add Branch"
				description="Create a company branch or satellite office for this workspace company."
				eyebrow="Branch management"
				maxWidthClassName="max-w-3xl"
				onClose={branchManagement.closeAddBranchDrawer}
				footer={
					<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={branchManagement.closeAddBranchDrawer}
							disabled={branchManagement.isCreatingBranch}
							className={`${moduleHeaderActionClassNames.secondary} disabled:cursor-not-allowed disabled:opacity-60`}
						>
							<X className="h-4 w-4" aria-hidden="true" />
							Cancel
						</button>
						<button
							type="submit"
							form={WorkspaceCompanyBranchFormId}
							disabled={branchManagement.isCreatingBranch}
							className={`${moduleHeaderActionClassNames.primary} disabled:cursor-not-allowed disabled:opacity-60`}
						>
							<Save className="h-4 w-4" aria-hidden="true" />
							Save Branch
						</button>
					</div>
				}
			>
				<form
					id={WorkspaceCompanyBranchFormId}
					onSubmit={branchManagement.handleCreateBranch}
					className="px-6 py-5"
				>
					<BranchDetailsFields
						errors={branchManagement.branchErrors}
						hideMainBranchField
						hideSatelliteTaxField
						isReadonly={branchManagement.isCreatingBranch}
						mainBranchOptions={branchManagement.mainBranchOptions}
						values={branchManagement.branchValues}
						onInputChange={branchManagement.handleBranchInputChange}
						onUpdateField={branchManagement.updateBranchField}
					/>
				</form>
			</ModuleDrawer>
		</>
	);
}

function BranchSummaryCard({
	branchCount,
	branches,
	companyId,
	isAddBranchOpen,
	isLoading,
	userCount,
	onAddBranch,
}: {
	branchCount: number;
	branches: WorkspaceCompanyBranchRecord[];
	companyId: string;
	isAddBranchOpen: boolean;
	isLoading: boolean;
	userCount: number;
	onAddBranch: () => void;
}) {
	const visibleBranches = branches.slice(0, 3);

	return (
		<div className="rounded-lg border border-darknavy/10 bg-offwhite/50 p-4">
			<div className="flex items-start gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-skyblue/15 text-darknavy">
					<GitBranch className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0">
					<p className="text-sm font-semibold text-darknavy">
						Branch Management
					</p>
					<p className="mt-1 text-sm leading-6 text-darknavy/58">
						Branches and satellites live inside this company. User
						access is assigned from Workspace Users Management.
					</p>
				</div>
			</div>
			<div className="mt-5 grid grid-cols-2 gap-3">
				<Detail label="Branches" value={String(branchCount)} />
				<Detail label="Users" value={String(userCount)} />
			</div>
			<div className="mt-5">
				<button
					type="button"
					onClick={onAddBranch}
					disabled={isAddBranchOpen}
					className={`${moduleHeaderActionClassNames.primary} w-full disabled:cursor-not-allowed disabled:opacity-60`}
				>
					<Plus className="h-4 w-4" aria-hidden="true" />
					{isAddBranchOpen ? "Adding Branch" : "Add Branch"}
				</button>
			</div>
			<div className="mt-5 overflow-hidden rounded-lg border border-darknavy/10 bg-white">
				<div className="border-b border-darknavy/10 bg-darknavy/[0.03] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-darknavy/50">
					Company Branches
				</div>
				<div className="divide-y divide-darknavy/10">
					{isLoading ? (
						<p className="px-3 py-4 text-sm font-medium text-darknavy/55">
							Loading branches...
						</p>
					) : visibleBranches.length > 0 ? (
						visibleBranches.map((branch) => (
							<CompanyBranchSummaryRow
								key={branch.id}
								branch={branch}
							/>
						))
					) : (
						<p className="px-3 py-4 text-sm font-medium text-darknavy/55">
							No branch records yet.
						</p>
					)}
				</div>
				{visibleBranches.length > 0 ? (
					<div className="flex items-center justify-between gap-3 border-t border-darknavy/10 px-3 py-2">
						<p className="text-xs font-semibold text-darknavy/45">
							Showing {visibleBranches.length} of {branches.length}
						</p>
						<Link
							href={getWorkspaceCompanyBranchesHref(companyId)}
							className="text-xs font-semibold text-skyblue transition hover:text-darknavy"
						>
							See all
						</Link>
					</div>
				) : null}
			</div>
		</div>
	);
}

function CompanyBranchSummaryRow({
	branch,
}: {
	branch: WorkspaceCompanyBranchRecord;
}) {
	const Icon = branch.branchType === "Satellite" ? GitBranch : Building2;
	const branchDisplayName = getBranchDisplayLabel(branch);
	const branchTypeLabel = branch.isMain ? "Head Office" : branch.branchType;

	return (
		<article className="grid gap-3 px-3 py-3">
			<div className="flex min-w-0 items-start gap-3">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-skyblue/15 text-darknavy">
					<Icon className="h-5 w-5" aria-hidden="true" />
				</span>
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-sm font-semibold text-darknavy">
						{branchDisplayName}
					</h3>
					<p className="mt-1 truncate text-xs text-darknavy/50">
						{branch.address || "No address set"}
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<Detail label="Type" value={branchTypeLabel} />
				<Detail label="TIN" value={branch.tin} />
			</div>
		</article>
	);
}

function Detail({ label, value }: { label: string; value?: string }) {
	const displayValue = value?.trim() || "-";

	return (
		<div className="min-w-0">
			<p className="text-xs font-semibold uppercase tracking-wide text-darknavy/45">
				{label}
			</p>
			<p className="mt-1 break-words text-sm font-semibold text-darknavy">
				{displayValue}
			</p>
		</div>
	);
}
