export const JournalVoucherQueryKeys = {
  all: (companyId?: number | null, branchUnitId?: number | null) =>
    ["general-journal", "journal-voucher", companyId ?? "no-company", branchUnitId ?? "no-branch"] as const,
  lists: (companyId?: number | null, branchUnitId?: number | null) =>
    [...JournalVoucherQueryKeys.all(companyId, branchUnitId), "list"] as const,
  list: (companyId?: number | null, branchUnitId?: number | null) =>
    [...JournalVoucherQueryKeys.lists(companyId, branchUnitId), { limit: 500 }] as const,
  detail: (companyId: number | null | undefined, branchUnitId: number | null | undefined, recordId: string) =>
    [...JournalVoucherQueryKeys.all(companyId, branchUnitId), "detail", recordId] as const,
  numberSuggestion: (companyId?: number | null, branchUnitId?: number | null) =>
    [...JournalVoucherQueryKeys.all(companyId, branchUnitId), "transaction-number"] as const,
  lookups: (companyId?: number | null, branchUnitId?: number | null) =>
    [...JournalVoucherQueryKeys.all(companyId, branchUnitId), "lookups"] as const,
  copyFromCandidates: (
    target: string,
    companyId?: number | null,
    branchUnitId?: number | null,
    partyCode?: string | null,
    partyName?: string | null,
  ) => [...JournalVoucherQueryKeys.all(companyId, branchUnitId), "copy-from", target, partyCode ?? "", partyName ?? ""] as const,
  paymentVoucherCopyFromCandidates: (
    source: "cash-voucher" | "disbursement-voucher",
    companyId?: number | null,
    branchUnitId?: number | null,
  ) => [...JournalVoucherQueryKeys.all(companyId, branchUnitId), "copy-from", source] as const,
  records: (companyId?: number | null, branchUnitId?: number | null) => JournalVoucherQueryKeys.list(companyId, branchUnitId),
};
