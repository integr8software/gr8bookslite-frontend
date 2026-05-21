"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	getWorkspaceCompanyHref,
	getWorkspaceCompanyUsersHref,
} from "@/app/src/constants/modules/workspace-companies/WorkspaceCompanyConstants";
import { getNextWorkspaceCompanyStatus } from "@/app/src/data/modules/workspace/companies/WorkspaceCompanyData";
import {
	useWorkspaceCompanyContext,
	useWorkspaceCompanyManagementStore,
} from "@/app/src/hooks/modules/workspace/companies/useWorkspaceCompanyManagement";
import type { WorkspaceCompanyUserRecord } from "@/app/src/types/modules/workspace-companies/WorkspaceCompanyTypes";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { AppConfirmDialog } from "@/app/src/ui/shared/system/AppConfirmDialog";
import { WorkspaceCompanyNotFound } from "./WorkspaceCompanyNotFound";
import { CompanyUsersTable } from "./CompanyUsersTable";

export function WorkspaceCompanyUsersMain() {
	const { company, companyUsers, isLoading } = useWorkspaceCompanyContext();
	const updateCompanyUser = useWorkspaceCompanyManagementStore(
		(state) => state.updateCompanyUser,
	);
	const isMutating = useWorkspaceCompanyManagementStore(
		(state) => state.isMutating,
	);
	const [pendingStatusUser, setPendingStatusUser] =
		useState<WorkspaceCompanyUserRecord | null>(null);
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

	const usersHref = getWorkspaceCompanyUsersHref(company.id);

	function handleConfirmStatusChange() {
		if (!pendingStatusUser) {
			return;
		}

		updateCompanyUser({
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
				title="Users"
				description={`Manage company-level users for ${company.name}. Branch-specific users are managed inside each branch.`}
				eyebrow={
					<>
						<Users className="h-3.5 w-3.5" aria-hidden="true" />
						Company users
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
							href={`${usersHref}/add`}
							className={moduleHeaderActionClassNames.primary}
						>
							<Plus className="h-4 w-4" aria-hidden="true" />
							Add User
						</Link>
					</>
				}
			/>
			<CompanyUsersTable
				baseHref={usersHref}
				isLoading={isLoading}
				users={companyUsers}
				onStatusChange={setPendingStatusUser}
			/>
			<AppConfirmDialog
				isOpen={Boolean(pendingStatusUser)}
				isPending={isMutating}
				title={
					nextStatus === "Inactive"
						? "Set user as inactive?"
						: "Set user as active?"
				}
				description={`This will mark ${
					pendingStatusUser?.name ?? "the selected user"
				} as ${nextStatus.toLowerCase()} while keeping the company user record available.`}
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
