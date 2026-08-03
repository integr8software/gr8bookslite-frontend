export const AccountsPayableVoucherQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) =>
    [
      "accounts-payable",
      "accounts-payable-voucher",
      companyId ?? "no-company",
      branchUnitId ?? "no-branch",
    ] as const,
  lists: (companyId?: number | null, branchUnitId?: number | null) =>
    [...AccountsPayableVoucherQueryKeys.all(companyId, branchUnitId), "list"] as const,
  list: (companyId?: number | null, branchUnitId?: number | null) =>
    [
      ...AccountsPayableVoucherQueryKeys.lists(companyId, branchUnitId),
      { limit: 500 },
    ] as const,
  details: (companyId?: number | null, branchUnitId?: number | null) =>
    [
      ...AccountsPayableVoucherQueryKeys.all(companyId, branchUnitId),
      "detail",
    ] as const,
  detail: (
    companyId: number | null | undefined,
    branchUnitId: number | null | undefined,
    recordId: string,
  ) =>
    [
      ...AccountsPayableVoucherQueryKeys.details(companyId, branchUnitId),
      recordId,
    ] as const,
  numberSuggestion: (
    companyId?: number | null,
    branchUnitId?: number | null,
  ) =>
    [
      ...AccountsPayableVoucherQueryKeys.all(companyId, branchUnitId),
      "transaction-number",
    ] as const,
  lookups: (companyId?: number | null, branchUnitId?: number | null) =>
    [
      ...AccountsPayableVoucherQueryKeys.all(companyId, branchUnitId),
      "lookups",
    ] as const,
  lookup: (
    name: string,
    companyId?: number | null,
    branchUnitId?: number | null,
  ) =>
    [
      ...AccountsPayableVoucherQueryKeys.lookups(companyId, branchUnitId),
      name,
    ] as const,
  records: (companyId?: number | null, branchUnitId?: number | null) =>
    AccountsPayableVoucherQueryKeys.list(companyId, branchUnitId),
};
