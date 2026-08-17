export const BillingQueryKeys = {
	all: (companyId?: number | null, branchUnitId?: number | null) =>
		["sales", "billing", companyId, branchUnitId] as const,
	detail: (
		companyId?: number | null,
		branchUnitId?: number | null,
		recordId?: string,
	) =>
		[
			"sales",
			"billing",
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
			"billing",
			companyId,
			branchUnitId,
			"number-suggestion",
		] as const,
	records: (companyId?: number | null, branchUnitId?: number | null) =>
		[
			"sales",
			"billing",
			companyId,
			branchUnitId,
			"records",
		] as const,
};
