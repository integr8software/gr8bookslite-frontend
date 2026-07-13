export const JournalVoucherQueryKeys = {
  all: ["journal-voucher"] as const,
  records: () => [...JournalVoucherQueryKeys.all, "records"] as const,
};
