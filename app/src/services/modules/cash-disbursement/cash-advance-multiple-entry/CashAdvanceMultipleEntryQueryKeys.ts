export const CashAdvanceMultipleEntryQueryKeys = {
  all: ["cash-advance-multiple-entry"] as const,
  records: ["cash-advance-multiple-entry", "records"] as const,
  record: (id: string) => ["cash-advance-multiple-entry", "record", id] as const,
  transactionNo: ["cash-advance-multiple-entry", "transaction-no"] as const,
};
