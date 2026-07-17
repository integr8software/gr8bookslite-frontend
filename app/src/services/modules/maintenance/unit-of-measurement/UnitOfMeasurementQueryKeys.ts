export const UnitOfMeasurementQueryKeys = {
	all: () => ["maintenance", "unit-of-measurement"] as const,
	list: () => ["maintenance", "unit-of-measurement", "list"] as const,
	detail: (id: string) =>
		["maintenance", "unit-of-measurement", "detail", id] as const,
};
