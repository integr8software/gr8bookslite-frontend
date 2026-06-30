"use client";

import { useAppStore } from "@/app/src/hooks/shared/app/useAppStore";
import {
	useWorkspaceCompanyMainLayoutBranches,
} from "@/app/src/hooks/workspace/companies/useWorkspaceCompanyMainLayoutBranches";

export function useBranchUserRoleContext() {
	const storedAccessToken = useAppStore((state) => state.accessToken);
	const storedActiveCompanyId = useAppStore((state) => state.activeCompanyId);
	const storedActiveCompanyName = useAppStore((state) => state.activeCompanyName);
	const storedActiveBranchId = useAppStore((state) => state.activeBranchId);
	const storedActiveBranchName = useAppStore((state) => state.activeBranchName);
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
	const branchName =
		storedActiveBranchName ??
		fallbackBranch?.name ??
		null;
	const companyId = fallbackCompanyId;
	const companyName = storedActiveCompanyName ?? null;

	return {
		accessToken,
		branchId,
		branchName,
		companyId,
		companyName,
		isLoadingBranchContext: !branchId && fallbackBranches.isLoading,
	};
}
