import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";

export const ItemCategoryQueryKeys = {
	all: ["maintenance", "item-category"] as const,
	setupRecords: (kind: ItemSetupKind) =>
		[...ItemCategoryQueryKeys.all, "setup-records", kind] as const,
};
