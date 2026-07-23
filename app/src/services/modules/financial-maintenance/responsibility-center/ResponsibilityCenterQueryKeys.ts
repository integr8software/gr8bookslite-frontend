export const ResponsibilityCenterQueryKeys = {
	all: () => ["responsibility-center"] as const,
	classifications: () => ["responsibility-center", "classifications"] as const,
	centers: () => ["responsibility-center", "centers"] as const,
	types: (classificationId?: string) =>
		["responsibility-center", "types", classificationId ?? "all"] as const,
};
