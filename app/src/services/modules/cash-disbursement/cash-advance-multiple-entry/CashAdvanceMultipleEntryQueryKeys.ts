const CashAdvanceMultipleEntryQuerySegment = "cash-advance-multiple-entry";

export const CashAdvanceMultipleEntryQueryKeys = {
  all: [CashAdvanceMultipleEntryQuerySegment] as const,
  records: [CashAdvanceMultipleEntryQuerySegment, "records"] as const,
  record: (id: string) => [CashAdvanceMultipleEntryQuerySegment, "record", id] as const,
  transactionNo: [CashAdvanceMultipleEntryQuerySegment, "transaction-no"] as const,
};
