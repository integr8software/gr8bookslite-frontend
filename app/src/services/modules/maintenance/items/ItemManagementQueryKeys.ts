import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

export const ItemManagementQueryKeys = {
	itemAttributes: () => ["maintenance", "item-attributes"] as const,
	itemBundles: () => ["maintenance", "item-bundles"] as const,
	itemSuppliers: () => ["maintenance", "item-suppliers"] as const,
	priceLists: () => ["maintenance", "price-lists"] as const,
	items: () => ["maintenance", "items"] as const,
	setupRecords: (kind: ItemSetupKind) =>
		["maintenance", kind] as const,
};

