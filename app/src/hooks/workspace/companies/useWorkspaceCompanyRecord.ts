"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import { GetWorkspaceCompany } from "@/app/src/services/workspace/companies/WorkspaceCompanyApi";
import { WorkspaceCompanyQueryKeys } from "@/app/src/services/workspace/companies/WorkspaceCompanyQueryKeys";
import type { WorkspaceCompanyRecord } from "@/app/src/types/workspace/WorkspaceCompanyTypes";

export function useWorkspaceCompanyRecord(companyId?: string) {
	const queryClient = useQueryClient();
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const accessToken = storedAccessToken;

	return useQuery({
		queryKey: WorkspaceCompanyQueryKeys.company(companyId ?? "missing"),
		queryFn: async () => {
			if (!accessToken || !companyId) {
				throw new Error("Company record is not available.");
			}

			return GetWorkspaceCompany(companyId);
		},
		enabled: Boolean(accessToken && companyId),
		initialData: () =>
			queryClient
				.getQueryData<WorkspaceCompanyRecord[]>(
					WorkspaceCompanyQueryKeys.companies(),
				)
				?.find((company) => company.id === companyId),
	});
}
