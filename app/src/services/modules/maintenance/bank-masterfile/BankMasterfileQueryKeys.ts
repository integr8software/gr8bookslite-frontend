export const BankMasterfileQueryKeys = {
	all: () => ["bank-masterfile"] as const,
	banks: () => [...BankMasterfileQueryKeys.all(), "banks"] as const,
	nextAccountCode: () =>
		[...BankMasterfileQueryKeys.all(), "next-account-code"] as const,
};