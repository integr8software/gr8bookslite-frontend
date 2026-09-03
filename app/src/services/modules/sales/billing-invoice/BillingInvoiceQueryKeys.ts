export const BillingInvoiceQueryKeys = {
	all: (companyId?: number | null, branchUnitId?: number | null) =>
		["sales", "billing-invoice", companyId, branchUnitId] as const,
	detail: (
		companyId?: number | null,
		branchUnitId?: number | null,
		recordId?: string,
	) =>
		[
			"sales",
			"billing-invoice",
			companyId,
			branchUnitId,
			"detail",
			recordId,
		] as const,
	records: (companyId?: number | null, branchUnitId?: number | null) =>
		[
			"sales",
			"billing-invoice",
			companyId,
			branchUnitId,
			"records",
		] as const,
};
