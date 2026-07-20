export const WarehouseTransferQueryKeys = {
	all: () => ["maintenance", "warehouse-transfers"] as const,
	list: () => [...WarehouseTransferQueryKeys.all(), "list"] as const,
	detail: (recordId: string | null | undefined) =>
		[...WarehouseTransferQueryKeys.all(), "detail", recordId] as const,
};
