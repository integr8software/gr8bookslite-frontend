export const UnitOfMeasurementQueryKeys = {
	all: () => ["unitOfMeasurement"] as const,
	list: () => ["unitOfMeasurement", "list"] as const,
	detail: (id: string) =>
		["unitOfMeasurement", "detail", id] as const,
};
