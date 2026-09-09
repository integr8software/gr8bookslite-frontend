import { QueryLookupScope } from "@/app/src/constants/shared/query/QueryKeyConstants";

export const DisbursementVoucherQueryKeys = {
	all: ["disbursement-voucher"] as const,
	records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
		[...DisbursementVoucherQueryKeys.all, "records", companyId, branchUnitId, query] as const,
	record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "detail", id, companyId, branchUnitId] as const,
	transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, "transaction-no", companyId, branchUnitId] as const,
	lookups: () =>
		[...DisbursementVoucherQueryKeys.all, QueryLookupScope] as const,
	parties: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, QueryLookupScope, "parties", companyId] as const,
	accounts: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, QueryLookupScope, "accounts", companyId] as const,
	responsibilityCenters: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, QueryLookupScope, "responsibility-centers", companyId] as const,
	terms: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, QueryLookupScope, "terms", companyId] as const,
	expenseTypes: (companyId?: number | null) =>
		[...DisbursementVoucherQueryKeys.all, QueryLookupScope, "expense-types", companyId] as const,
};

