export const PettyCashVoucherQueryKeys = {
	all: ["petty-cash-voucher"] as const,
	vouchers: () =>
		[...PettyCashVoucherQueryKeys.all, "vouchers"] as const,
	voucher: (recordId?: string) =>
		[...PettyCashVoucherQueryKeys.all, "vouchers", recordId] as const,
};

