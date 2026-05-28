"use client";

import { useQuery } from "@tanstack/react-query";
import { getMasterPlanAndPackages } from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApi";
import { MasterPlanAndPackageQueryKeys } from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageQueryKeys";

type UseMasterPlanAndPackagesQueryParams = {
	enabled?: boolean;
};

export function useMasterPlanAndPackagesQuery({
	enabled = true,
}: UseMasterPlanAndPackagesQueryParams = {}) {
	return useQuery({
		queryKey: MasterPlanAndPackageQueryKeys.lists(),
		queryFn: async () => getMasterPlanAndPackages(),
		enabled,
	});
}
