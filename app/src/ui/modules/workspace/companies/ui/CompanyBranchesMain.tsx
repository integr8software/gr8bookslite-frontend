"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, Plus } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	getWorkspaceCompanyBranchesHref,
	getWorkspaceCompanyHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
	useWorkspaceCompanyContext,
	useWorkspaceCompanyManagementStore,
} from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceCompanyBranchRecord } from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";
import { CompanyBranchesTable } from "./CompanyBranchesTable";

export function WorkspaceCompanyBranchesMain() {
	const {
		company,
		companyBranches,
		companyBranchUsers,
		isLoading,
	} = useWorkspaceCompanyContext();
	const updateBranch = useWorkspaceCompanyManagementStore(
		(state) => state.updateBranch,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const [pendingStatusBranch, setPendingStatusBranch] =
		useState<WorkspaceCompanyBranchRecord | null>(null);
	const nextStatus = pendingStatusBranch
		? getNextWorkspaceCompanyStatus(pendingStatusBranch.status)
		: "Inactive";

	if (!company) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	const branchesHref = getWorkspaceCompanyBranchesHref(company.id);

	function handleConfirmStatusChange() {
		if (!pendingStatusBranch) {
			return;
		}

		updateBranch({
			...pendingStatusBranch,
			status: nextStatus,
		});
		setPendingStatusBranch(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Branch Management"
				description={`Manage branches for ${company.name}. Users added inside a branch appear only in that branch user list.`}
				eyebrow={
					<>
						<GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
						Company branches
					</>
				}
				actions={
					<>
						<Link
							href={getWorkspaceCompanyHref(company.id)}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Company
						</Link>
						<Link
							href={`${branchesHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Branch
						</Link>
					</>
				}
			/>
			<CompanyBranchesTable
				baseHref={branchesHref}
				branchUsers={companyBranchUsers}
				branches={companyBranches}
				companyId={company.id}
				isLoading={isLoading}
				onStatusChange={setPendingStatusBranch}
			/>
			<AppConfirmDialog
				isOpen={Boolean(pendingStatusBranch)}
				isPending={isMutating}
				title={
					nextStatus === "Inactive"
						? "Set branch as inactive?"
						: "Set branch as active?"
				}
				description={`This will mark ${
					pendingStatusBranch?.name ?? "the selected branch"
				} as ${nextStatus.toLowerCase()} while keeping its branch user records available.`}
				confirmLabel={
					nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
				}
				tone={nextStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => setPendingStatusBranch(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</section>
	);
}
