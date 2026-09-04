export const PettyCashReplenishmentQueryKeys = {
	all: ["petty-cash-replenishment"] as const,
	list: (filters?: unknown) =>
		[...PettyCashReplenishmentQueryKeys.all, "list", filters] as const,
	record: (recordId?: string) =>
		[...PettyCashReplenishmentQueryKeys.all, recordId] as const,
};

