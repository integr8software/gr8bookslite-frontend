export const AdvancesToSuppliersQueryKeys = {
  all: ["advances-to-suppliers"] as const,
  records: (companyId?: number | null) => [...AdvancesToSuppliersQueryKeys.all, "records", companyId] as const,
  record: (id: string) => [...AdvancesToSuppliersQueryKeys.all, "record", id] as const,
  transactionNo: () => [...AdvancesToSuppliersQueryKeys.all, "transaction-no"] as const,
  copyFromCandidates: (
    target: "cash-voucher" | "disbursement-voucher",
    companyId?: number | null,
    branchUnitId?: number | null,
    partyCode?: string | null,
    partyName?: string | null,
  ) =>
    [
      ...AdvancesToSuppliersQueryKeys.all,
      "copy-from",
      target,
      companyId ?? null,
      branchUnitId ?? null,
      partyCode?.trim() || null,
      partyName?.trim() || null,
    ] as const,
};
