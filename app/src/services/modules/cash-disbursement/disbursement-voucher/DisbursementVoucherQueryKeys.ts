const DisbursementVoucherQuerySegment = "disbursement-voucher";
const DisbursementVoucherLookupsQuerySegment = "lookups";

export const DisbursementVoucherQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) => {
    void companyId;
    void branchUnitId;
    return [DisbursementVoucherQuerySegment] as const;
  },
  records: (companyId?: number | null, branchUnitId?: number | null, query?: unknown) =>
    [DisbursementVoucherQuerySegment, 'records', companyId, branchUnitId, query] as const,
  record: (id: string, companyId?: number | null, branchUnitId?: number | null) =>
    [DisbursementVoucherQuerySegment, 'detail', id, companyId, branchUnitId] as const,
  transactionNo: (companyId?: number | null, branchUnitId?: number | null) =>
    [DisbursementVoucherQuerySegment, 'transaction-no', companyId, branchUnitId] as const,
  parties: (companyId?: number | null) =>
    [DisbursementVoucherQuerySegment, DisbursementVoucherLookupsQuerySegment, 'parties', companyId] as const,
  accounts: (companyId?: number | null) =>
    [DisbursementVoucherQuerySegment, DisbursementVoucherLookupsQuerySegment, 'accounts', companyId] as const,
  responsibilityCenters: (companyId?: number | null) =>
    [DisbursementVoucherQuerySegment, DisbursementVoucherLookupsQuerySegment, 'responsibility-centers', companyId] as const,
  terms: (companyId?: number | null) =>
    [DisbursementVoucherQuerySegment, DisbursementVoucherLookupsQuerySegment, 'terms', companyId] as const,
  expenseTypes: (companyId?: number | null) =>
    [DisbursementVoucherQuerySegment, DisbursementVoucherLookupsQuerySegment, 'expense-types', companyId] as const,
};
