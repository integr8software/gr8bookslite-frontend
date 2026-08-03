import type { ItemSetupKind } from "@/app/src/types/modules/item-management/item-category/ItemCategoryTypes";

export const ItemCategoryQueryKeys = {
	all: () => ["maintenance", "item-category"] as const,
	categories: () => [...ItemCategoryQueryKeys.all(), "categories"] as const,
	setupRecords: (kind: ItemSetupKind) =>
		[...ItemCategoryQueryKeys.all(), "setup-records", kind] as const,
};
