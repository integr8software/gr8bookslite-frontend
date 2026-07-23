export const WarehouseStorageQueryKeys = {
	all: () => ["maintenance", "warehouse-storage"] as const,
	list: () => [...WarehouseStorageQueryKeys.all(), "list"] as const,
	detail: (recordId: string | null | undefined) =>
		[...WarehouseStorageQueryKeys.all(), "detail", recordId] as const,
};
