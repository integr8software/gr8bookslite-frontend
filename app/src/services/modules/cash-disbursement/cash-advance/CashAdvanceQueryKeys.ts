export const CashAdvanceQueryKeys = {
  all: ["cash-advance"] as const,
  records: (companyId?: number | null) => [...CashAdvanceQueryKeys.all, "records", companyId] as const,
  record: (id: string) => [...CashAdvanceQueryKeys.all, "record", id] as const,
  transactionNo: () => [...CashAdvanceQueryKeys.all, "transaction-no"] as const,
  copyFromCandidates: (
    target: "cash-voucher" | "disbursement-voucher",
    companyId?: number | null,
    branchUnitId?: number | null,
    partyCode?: string,
    partyName?: string,
  ) => [...CashAdvanceQueryKeys.all, "copy-from", target, companyId, branchUnitId, partyCode, partyName] as const,
};
