import type { ItemStatus } from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";

export type ItemPromotionType =
	| "Buy 1 Take 1"
	| "Bundle Discount"
	| "Fixed Discount"
	| "Percentage Discount";

export type ItemPromotionRecord = {
	id: string;
	code: string;
	name: string;
	type: ItemPromotionType;
	itemId: string;
	bundleId: string;
	discountId: string;
	freeItemId: string;
	value: number;
	startDate: string;
	endDate: string;
	minimumQuantity: number;
	status: ItemStatus;
};

export type ItemPromotionListRecord = ItemPromotionRecord & {
	discountManagementRule: string;
	item: string;
	validity: string;
	valueLabel: string;
};

export type ItemPromotionFormValues = Omit<ItemPromotionRecord, "id">;

export type ItemPromotionMode = "add" | "edit" | "view";

export type ItemPromotionTableColumnKey =
	| "code"
	| "name"
	| "type"
	| "item"
	| "valueLabel"
	| "discountManagementRule"
	| "validity"
	| "status";
