"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
	const accessToken = storedAccessToken;
	const companyId = company?.id ?? "";
	const companyBranchesQuery = useQuery({
		enabled: Boolean(companyId && accessToken),
		queryKey: WorkspaceCompanyQueryKeys.companyBranches(companyId),
		queryFn: async () => getWorkspaceCompanyUnits(accessToken, companyId),
		staleTime: 1000 * 60 * 5,
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
