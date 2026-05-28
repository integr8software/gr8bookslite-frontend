"use client";

import Link from "next/link";
import { Plus, UserCog } from "lucide-react";
import { WorkspaceUsersManagementHref } from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WorkspaceUsersTable } from "@/app/src/ui/workspace/users-management/WorkspaceUsersTable";

export function WorkspaceUsersManagementMain() {
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const isLoading = useWorkspaceCompanyManagementStore(
		(state) => state.isLoading,
	);

	return (
		<section className="grid gap-5">
			<ModuleHeader
				variant="panel"
				titleAs="h1"
				title="Users Management"
				description="Maintain workspace users and assign each account to one or more companies, branches, or satellites."
				eyebrow={
					<>
						<UserCog className="h-3.5 w-3.5" aria-hidden="true" />
						Workspace
					</>
				}
				actions={
					<Link
						href={`${WorkspaceUsersManagementHref}/add`}
						className={moduleHeaderActionClassNames.primary}
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
						Add User
					</Link>
				}
			/>
			<WorkspaceUsersTable
				baseHref={WorkspaceUsersManagementHref}
				isLoading={isLoading}
				users={users}
			/>
		</section>
	);
}
