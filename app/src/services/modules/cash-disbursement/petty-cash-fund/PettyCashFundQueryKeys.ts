export const PettyCashFundQueryKeys = {
	all: ["petty-cash-fund"] as const,
	list: (filters?: unknown) =>
		[...PettyCashFundQueryKeys.all, "list", filters] as const,
	record: (recordId?: string) =>
		[...PettyCashFundQueryKeys.all, recordId] as const,
};

