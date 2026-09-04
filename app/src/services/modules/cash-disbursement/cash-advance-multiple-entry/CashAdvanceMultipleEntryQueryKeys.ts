export const CashAdvanceMultipleEntryQueryKeys = {
	all: ["cash-advance-multiple-entry"] as const,
	records: (companyId?: number | null) =>
		[...CashAdvanceMultipleEntryQueryKeys.all, "records", companyId] as const,
	record: (id: string) =>
		[...CashAdvanceMultipleEntryQueryKeys.all, "record", id] as const,
	transactionNo: () =>
		[...CashAdvanceMultipleEntryQueryKeys.all, "transaction-no"] as const,
};

