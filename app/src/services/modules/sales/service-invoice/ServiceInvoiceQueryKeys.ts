export const ServiceInvoiceQueryKeys = {
	all: (companyId?: number | null, branchUnitId?: number | null) =>
		["sales", "service-invoice", companyId, branchUnitId] as const,
	detail: (
		companyId?: number | null,
		branchUnitId?: number | null,
		recordId?: string,
	) =>
		[
			"sales",
			"service-invoice",
			companyId,
			branchUnitId,
			"detail",
			recordId,
		] as const,
	numberSuggestion: (
		companyId?: number | null,
		branchUnitId?: number | null,
	) =>
		[
			"sales",
			"service-invoice",
			companyId,
			branchUnitId,
			"number-suggestion",
		] as const,
	records: (companyId?: number | null, branchUnitId?: number | null) =>
		[
			"sales",
			"service-invoice",
			companyId,
			branchUnitId,
			"records",
		] as const,
};
