export const StorageLocationQueryKeys = {
	all: () => ["maintenance", "storage-locations"] as const,
	list: () => [...StorageLocationQueryKeys.all(), "list"] as const,
	detail: (recordId: string | null | undefined) =>
		[...StorageLocationQueryKeys.all(), "detail", recordId] as const,
};
