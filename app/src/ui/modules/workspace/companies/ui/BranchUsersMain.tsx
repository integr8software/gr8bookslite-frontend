"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	getWorkspaceCompanyBranchUsersHref,
	getWorkspaceCompanyBranchesHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
	useWorkspaceCompanyContext,
	useWorkspaceCompanyManagementStore,
} from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceBranchUserRecord } from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";
import { BranchUsersTable } from "./BranchUsersTable";

export function WorkspaceBranchUsersMain() {
	const {
		branch,
		company,
		isLoading,
		selectedBranchUsers,
	} = useWorkspaceCompanyContext();
	const updateBranchUser = useWorkspaceCompanyManagementStore(
		(state) => state.updateBranchUser,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const [pendingStatusUser, setPendingStatusUser] =
		useState<WorkspaceBranchUserRecord | null>(null);
	const nextStatus = pendingStatusUser
		? getNextWorkspaceCompanyStatus(pendingStatusUser.status)
		: "Inactive";

	if (!company) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	if (!branch) {
		return (
			<WorkspaceCompanyNotFound
				href={getWorkspaceCompanyBranchesHref(company.id)}
				title="Branch Not Found"
			/>
		);
	}

	const usersHref = getWorkspaceCompanyBranchUsersHref(company.id, branch.id);

	function handleConfirmStatusChange() {
		if (!pendingStatusUser) {
			return;
		}

		updateBranchUser({
			...pendingStatusUser,
			status: nextStatus,
		});
		setPendingStatusUser(null);
	}

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title={`${branch.name} Users`}
				description={`Manage users who belong only to ${branch.name}. These records are separate from the company-level user list because branch roles can differ.`}
				eyebrow={
					<>
						<Users className="h-3.5 w-3.5" aria-hidden="true" />
						Branch users
					</>
				}
				actions={
					<>
						<Link
							href={`${getWorkspaceCompanyBranchesHref(company.id)}/view/${branch.id}`}
							className={moduleHeaderActionClassNames.secondary}
						>
							<ArrowLeft className="h-4 w-4" aria-hidden="true" />
							Branch
						</Link>
						<Link
							href={`${usersHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add Branch User
						</Link>
					</>
				}
			/>
			<BranchUsersTable
				baseHref={usersHref}
				isLoading={isLoading}
				users={selectedBranchUsers}
				onStatusChange={setPendingStatusUser}
			/>
			<AppConfirmDialog
				isOpen={Boolean(pendingStatusUser)}
				isPending={isMutating}
				title={
					nextStatus === "Inactive"
						? "Set branch user as inactive?"
						: "Set branch user as active?"
				}
				description={`This will mark ${
					pendingStatusUser?.name ?? "the selected branch user"
				} as ${nextStatus.toLowerCase()} only for this branch.`}
				confirmLabel={
					nextStatus === "Inactive" ? "Set as Inactive" : "Set as Active"
				}
				tone={nextStatus === "Inactive" ? "danger" : "success"}
				onCancel={() => setPendingStatusUser(null)}
				onConfirm={handleConfirmStatusChange}
			/>
		</section>
	);
}
