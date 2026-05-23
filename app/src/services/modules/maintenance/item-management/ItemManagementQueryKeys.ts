import type { ItemSetupKind } from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

export const ItemManagementQueryKeys = {
	items: () => ["maintenance", "item-management", "items"] as const,
	setupRecords: (kind: ItemSetupKind) =>
		["maintenance", "item-management", kind] as const,
};

