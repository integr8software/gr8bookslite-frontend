export const WarehouseAccessQueryKeys = {
	all: () => ["maintenance", "warehouse-access"] as const,
	list: () => [...WarehouseAccessQueryKeys.all(), "list"] as const,
	detail: (recordId: string | null | undefined) =>
		[...WarehouseAccessQueryKeys.all(), "detail", recordId] as const,
};
