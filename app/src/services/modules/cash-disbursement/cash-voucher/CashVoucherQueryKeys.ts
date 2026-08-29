export const CashVoucherQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) =>
    ['cash-voucher', companyId, branchUnitId] as const,
  records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
    ['cash-voucher', 'records', companyId, branchUnitId, query] as const,
  record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
    ['cash-voucher', 'detail', id, companyId, branchUnitId] as const,
  transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
    ['cash-voucher', 'transaction-no', companyId, branchUnitId] as const,
  parties: (companyId?: number | null) =>
    ['cash-voucher', 'lookups', 'parties', companyId] as const,
  accounts: (companyId?: number | null) =>
    ['cash-voucher', 'lookups', 'accounts', companyId] as const,
  responsibilityCenters: (companyId?: number | null) =>
    ['cash-voucher', 'lookups', 'responsibility-centers', companyId] as const,
  terms: (companyId?: number | null) =>
    ['cash-voucher', 'lookups', 'terms', companyId] as const,
  expenseTypes: (companyId?: number | null) =>
    ['cash-voucher', 'lookups', 'expense-types', companyId] as const,
};
