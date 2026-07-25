export const AccountsPayableVoucherQueryKeys = {
  all: () => ["accounts-payable-voucher"] as const,
  records: () => [...AccountsPayableVoucherQueryKeys.all(), "records"] as const,
};
