import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

export const ItemManagementQueryKeys = {
	itemAttributes: () => ["maintenance", "item-management", "item-attributes"] as const,
	itemBundles: () => ["maintenance", "item-management", "item-bundles"] as const,
	itemSuppliers: () => ["maintenance", "item-management", "item-suppliers"] as const,
	priceLists: () => ["maintenance", "item-management", "price-lists"] as const,
	items: () => ["maintenance", "item-management", "items"] as const,
	setupRecords: (kind: ItemSetupKind) =>
		["maintenance", "item-management", kind] as const,
};

