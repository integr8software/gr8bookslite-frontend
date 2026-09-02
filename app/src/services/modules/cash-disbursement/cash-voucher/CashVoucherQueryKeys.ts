const CashVoucherQuerySegment = "cash-voucher";
const CashVoucherLookupsQuerySegment = "lookups";

export const CashVoucherQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) =>
    [CashVoucherQuerySegment, companyId, branchUnitId] as const,
  records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
    [CashVoucherQuerySegment, 'records', companyId, branchUnitId, query] as const,
  record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
    [CashVoucherQuerySegment, 'detail', id, companyId, branchUnitId] as const,
  transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
    [CashVoucherQuerySegment, 'transaction-no', companyId, branchUnitId] as const,
  parties: (companyId?: number | null) =>
    [CashVoucherQuerySegment, CashVoucherLookupsQuerySegment, 'parties', companyId] as const,
  accounts: (companyId?: number | null) =>
    [CashVoucherQuerySegment, CashVoucherLookupsQuerySegment, 'accounts', companyId] as const,
  responsibilityCenters: (companyId?: number | null) =>
    [CashVoucherQuerySegment, CashVoucherLookupsQuerySegment, 'responsibility-centers', companyId] as const,
  terms: (companyId?: number | null) =>
    [CashVoucherQuerySegment, CashVoucherLookupsQuerySegment, 'terms', companyId] as const,
  expenseTypes: (companyId?: number | null) =>
    [CashVoucherQuerySegment, CashVoucherLookupsQuerySegment, 'expense-types', companyId] as const,
};
