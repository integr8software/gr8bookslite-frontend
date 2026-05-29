"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import {
	mapWorkspaceCompanyBranchesToMainBranches,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyMainLayoutBranchData";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	getWorkspaceCompanyUnits,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyUnitApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";

export function useWorkspaceCompanyMainLayoutBranches({
	company,
}: {
	company?: { id: string; initials?: string };
}) {
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken ?? GetAccessToken();
	const companyId = company?.id ?? "";
	const companyBranchesQuery = useQuery({
		enabled: Boolean(accessToken && companyId),
		queryKey: WorkspaceCompanyQueryKeys.companyBranches(companyId),
		queryFn: async () => getWorkspaceCompanyUnits(accessToken, companyId),
	});
	const branches = useMemo(
		() =>
			mapWorkspaceCompanyBranchesToMainBranches({
				branches: companyBranchesQuery.data ?? [],
				company,
			}),
		[company, companyBranchesQuery.data],
	);

	return {
		branches,
		isLoading: companyBranchesQuery.isLoading,
	};
}
