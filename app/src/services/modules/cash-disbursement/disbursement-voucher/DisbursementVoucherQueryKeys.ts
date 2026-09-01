export const DisbursementVoucherQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) => {
    void companyId;
    void branchUnitId;
    return ['disbursement-voucher'] as const;
  },
  records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
    ['disbursement-voucher', 'records', companyId, branchUnitId, query] as const,
  record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
    ['disbursement-voucher', 'detail', id, companyId, branchUnitId] as const,
  transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
    ['disbursement-voucher', 'transaction-no', companyId, branchUnitId] as const,
  parties: (companyId?: number | null) =>
    ['disbursement-voucher', 'lookups', 'parties', companyId] as const,
  accounts: (companyId?: number | null) =>
    ['disbursement-voucher', 'lookups', 'accounts', companyId] as const,
  responsibilityCenters: (companyId?: number | null) =>
    ['disbursement-voucher', 'lookups', 'responsibility-centers', companyId] as const,
  terms: (companyId?: number | null) =>
    ['disbursement-voucher', 'lookups', 'terms', companyId] as const,
  expenseTypes: (companyId?: number | null) =>
    ['disbursement-voucher', 'lookups', 'expense-types', companyId] as const,
};
