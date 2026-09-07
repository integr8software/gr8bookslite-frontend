export const RevolvingFundReplenishmentQueryKeys = {
	all: ["revolving-fund-replenishment"] as const,
	list: (filters?: unknown) =>
		[...RevolvingFundReplenishmentQueryKeys.all, "list", filters] as const,
	record: (recordId?: string) =>
		[...RevolvingFundReplenishmentQueryKeys.all, recordId] as const,
};

