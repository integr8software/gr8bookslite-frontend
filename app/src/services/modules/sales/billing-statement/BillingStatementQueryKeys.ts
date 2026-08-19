export const BillingStatementQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) =>
    ["sales", "billing-statement", companyId, branchUnitId] as const,
  detail: (
    companyId?: number | null,
    branchUnitId?: number | null,
    recordId?: string,
  ) =>
    [
      "sales",
      "billing-statement",
      companyId,
      branchUnitId,
      "detail",
      recordId,
    ] as const,
  records: (companyId?: number | null, branchUnitId?: number | null) =>
    [
      "sales",
      "billing-statement",
      companyId,
      branchUnitId,
      "records",
    ] as const,
};
