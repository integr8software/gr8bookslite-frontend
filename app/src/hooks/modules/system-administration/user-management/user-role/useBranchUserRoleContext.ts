"use client";

import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	useWorkspaceCompanyMainLayoutBranches,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyMainLayoutBranches";

export function useBranchUserRoleContext() {
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const storedActiveCompanyId = useAppStore((state) => state.activeCompanyId);
	const storedActiveBranchId = useAppStore((state) => state.activeBranchId);
	const accessToken = storedAccessToken;
	const fallbackCompanyId = storedActiveCompanyId
		? String(storedActiveCompanyId)
		: "";
	const fallbackBranches = useWorkspaceCompanyMainLayoutBranches({
		company: fallbackCompanyId ? { id: fallbackCompanyId } : undefined,
	});
	const fallbackBranch = fallbackBranches.branches[0];
	const branchId =
		(storedActiveBranchId ? String(storedActiveBranchId) : null) ??
		fallbackBranch?.id ??
		null;

	return {
		accessToken,
		branchId,
		isLoadingBranchContext: fallbackBranches.isLoading,
	};
}
