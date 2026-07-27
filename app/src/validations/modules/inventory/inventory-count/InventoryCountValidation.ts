import type { InventoryCountValues } from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

export function validateInventoryCount(values: InventoryCountValues) {
	if (!values.warehouse.trim()) {
		return "Select a warehouse.";
	}

	if (!values.countNo.trim()) {
		return "Enter an inventory count number.";
	}

	if (!values.countDate.trim()) {
		return "Enter an inventory count date.";
	}

	return "";
}
