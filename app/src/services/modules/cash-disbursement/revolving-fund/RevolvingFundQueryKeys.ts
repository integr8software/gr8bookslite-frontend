export const RevolvingFundQueryKeys = {
	all: ["revolving-fund"] as const,
	list: (filters?: unknown) =>
		[...RevolvingFundQueryKeys.all, "list", filters] as const,
	record: (recordId?: string) =>
		[...RevolvingFundQueryKeys.all, recordId] as const,
};

