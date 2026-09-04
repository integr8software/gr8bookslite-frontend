export const CashAdvanceQueryKeys = {
	all: ["cash-advance"] as const,
	records: (companyId?: number | null) =>
		[...CashAdvanceQueryKeys.all, "records", companyId] as const,
	record: (id: string) =>
		[...CashAdvanceQueryKeys.all, "record", id] as const,
	transactionNo: () =>
		[...CashAdvanceQueryKeys.all, "transaction-no"] as const,
};
