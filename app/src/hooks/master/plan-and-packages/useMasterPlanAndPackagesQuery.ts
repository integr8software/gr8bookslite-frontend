"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GetAccessToken } from "@/app/src/data/auth/AuthSessionStorage";
import { getMasterPlanAndPackages } from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageApi";
import { MasterPlanAndPackageQueryKeys } from "@/app/src/services/master/plan-and-packages/MasterPlanAndPackageQueryKeys";

type UseMasterPlanAndPackagesQueryParams = {
	enabled?: boolean;
};

export function useMasterPlanAndPackagesQuery({
	enabled = true,
}: UseMasterPlanAndPackagesQueryParams = {}) {
	const [accessToken] = useState(() => GetAccessToken());

	return useQuery({
		queryKey: MasterPlanAndPackageQueryKeys.lists(),
		queryFn: async () => getMasterPlanAndPackages(accessToken as string),
		enabled: enabled && Boolean(accessToken),
	});
}
