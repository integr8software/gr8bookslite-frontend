export const PettyCashVoucherQueryKeys = {
  all: ["petty-cash-voucher"] as const,
  list: (filters?: unknown) => [...PettyCashVoucherQueryKeys.all, "list", filters] as const,
  record: (recordId?: string) => [...PettyCashVoucherQueryKeys.all, recordId] as const,
};
