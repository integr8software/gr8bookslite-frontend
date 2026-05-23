import type { TransactionNumberSetupRecord } from "@/app/src/types/modules/system-administration/transaction-number-setup/TransactionNumberSetupTypes";

export function formatBranchScopeLabel(
	setup: Pick<TransactionNumberSetupRecord, "branchIds" | "scope">,
	branchNameById: Map<string, string>,
) {
	if (setup.scope === "all") {
		return "All branches";
	}

	if (setup.branchIds.length === 0) {
		return "No branch selected";
	}

	return setup.branchIds
		.map((branchId) => branchNameById.get(branchId) ?? branchId)
		.join(", ");
}
