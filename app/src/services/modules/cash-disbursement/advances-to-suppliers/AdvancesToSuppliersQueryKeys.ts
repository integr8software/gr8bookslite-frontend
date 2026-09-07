export const AdvancesToSuppliersQueryKeys = {
	all: ["advances-to-suppliers"] as const,
	records: (companyId?: number | null) =>
		[...AdvancesToSuppliersQueryKeys.all, "records", companyId] as const,
	record: (id: string) =>
		[...AdvancesToSuppliersQueryKeys.all, "record", id] as const,
	transactionNo: () =>
		[...AdvancesToSuppliersQueryKeys.all, "transaction-no"] as const,
};
