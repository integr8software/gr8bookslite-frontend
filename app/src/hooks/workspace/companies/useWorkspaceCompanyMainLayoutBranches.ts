"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	mapWorkspaceCompanyBranchesToMainBranches,
} from "@/app/src/data/workspace/companies/WorkspaceCompanyMainLayoutBranchData";
import type { MainBranch } from "@/app/src/data/shared/main-layout/MainLayoutTypes";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	getWorkspaceCompanyUnits,
} from "@/app/src/services/workspace/companies/WorkspaceCompanyUnitApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";

export function useWorkspaceCompanyMainLayoutBranches({
	company,
}: {
	company?: { id: string; initials?: string; branches?: MainBranch[] };
}) {
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken;
	const companyId = company?.id ?? "";
	const fallbackBranches = useMemo(
		() => company?.branches ?? [],
		[company?.branches],
	);
	const companyBranchesQuery = useQuery({
		enabled: Boolean(companyId && accessToken),
		queryKey: WorkspaceCompanyQueryKeys.companyBranches(companyId),
		queryFn: async () => getWorkspaceCompanyUnits(companyId),
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
	const visibleBranches = branches.length > 0 ? branches : fallbackBranches;

	return {
		branches: visibleBranches,
		isLoading: companyBranchesQuery.isLoading,
	};
}
