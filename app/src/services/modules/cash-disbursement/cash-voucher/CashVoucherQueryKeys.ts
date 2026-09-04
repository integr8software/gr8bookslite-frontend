export const CashVoucherQueryKeys = {
	all: ["cash-voucher"] as const,
	records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
		[...CashVoucherQueryKeys.all, "records", companyId, branchUnitId, query] as const,
	record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
		[...CashVoucherQueryKeys.all, "detail", id, companyId, branchUnitId] as const,
	transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
		[...CashVoucherQueryKeys.all, "transaction-no", companyId, branchUnitId] as const,
	lookups: () =>
		[...CashVoucherQueryKeys.all, "lookups"] as const,
	parties: (companyId?: number | null) =>
		[...CashVoucherQueryKeys.all, "lookups", "parties", companyId] as const,
	accounts: (companyId?: number | null) =>
		[...CashVoucherQueryKeys.all, "lookups", "accounts", companyId] as const,
	responsibilityCenters: (companyId?: number | null) =>
		[...CashVoucherQueryKeys.all, "lookups", "responsibility-centers", companyId] as const,
	terms: (companyId?: number | null) =>
		[...CashVoucherQueryKeys.all, "lookups", "terms", companyId] as const,
	expenseTypes: (companyId?: number | null) =>
		[...CashVoucherQueryKeys.all, "lookups", "expense-types", companyId] as const,
};

