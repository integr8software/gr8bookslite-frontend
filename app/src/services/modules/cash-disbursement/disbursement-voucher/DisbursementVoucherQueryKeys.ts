export const DisbursementVoucherQueryKeys = {
	all: ["disbursement-voucher"] as const,
	records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
		[...DisbursementVoucherQueryKeys.all, "records", companyId, branchUnitId, query] as const,
	record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "detail", id, companyId, branchUnitId] as const,
	transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "transaction-no", companyId, branchUnitId] as const,
	lookups: () =>
		[...DisbursementVoucherQueryKeys.all, "lookups"] as const,
	parties: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "lookups", "parties", companyId] as const,
	accounts: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "lookups", "accounts", companyId] as const,
	responsibilityCenters: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "lookups", "responsibility-centers", companyId] as const,
	terms: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "lookups", "terms", companyId] as const,
	expenseTypes: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "lookups", "expense-types", companyId] as const,
};

