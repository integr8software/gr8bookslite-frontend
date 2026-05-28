"use client";

import Link from "next/link";
import { ArrowLeft, Plus, Users } from "lucide-react";
import {
	WorkspaceCompaniesHref,
	getWorkspaceCompanyHref,
	getWorkspaceCompanyUsersHref,
} from "@/app/src/constants/workspace/WorkspaceCompanyConstants";
import { useWorkspaceCompanyContext } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagement";
import {
	ModuleHeader,
	moduleHeaderActionClassNames,
} from "@/app/src/ui/shared/module/ModuleHeader";
import { WorkspaceCompanyNotFound } from "@/app/src/ui/workspace/companies/WorkspaceCompanyNotFound";
import { CompanyUsersTable } from "@/app/src/ui/workspace/companies/CompanyUsersTable";

export function WorkspaceCompanyUsersMain() {
	const { company, companyUsers, isLoading } = useWorkspaceCompanyContext();

	if (!company) {
		return (
			<WorkspaceCompanyNotFound
				href={WorkspaceCompaniesHref}
				title="Company Not Found"
			/>
		);
	}

	const usersHref = getWorkspaceCompanyUsersHref(company.id);

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
			/>
		</section>
	);
}
