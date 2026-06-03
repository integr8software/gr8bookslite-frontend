"use client";

import { useWorkspaceCompanyManagementStore } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyManagementStore";
import { useWorkspaceCompanyRecord } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyRecord";
import { useWorkspaceCompanyRouteParams } from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyRouteParams";

export function useWorkspaceCompanyContext() {
	const params = useWorkspaceCompanyRouteParams();
	const companies = useWorkspaceCompanyManagementStore((state) => state.companies);
	const users = useWorkspaceCompanyManagementStore((state) => state.users);
	const branches = useWorkspaceCompanyManagementStore((state) => state.branches);
	const isLoading = useWorkspaceCompanyManagementStore(
		(state) => state.isLoading,
	);
	const companyQuery = useWorkspaceCompanyRecord(params.companyId);
	const company =
		companies.find((record) => record.id === params.companyId) ??
		companyQuery.data;
	const companyUsers = users.filter((user) =>
		user.companyAssignments.some(
			(assignment) => assignment.companyId === params.companyId,
		),
	);
	const companyBranches = branches.filter(
		(branch) => branch.companyId === params.companyId,
	);

	return {
		company,
		companyBranches,
		companyUsers,
		isLoading:
			isLoading ||
			Boolean(params.companyId && !company && companyQuery.isLoading),
		params,
	};
}
