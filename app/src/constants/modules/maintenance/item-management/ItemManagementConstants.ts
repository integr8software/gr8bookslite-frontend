import type {
	ItemSetupKind,
	ItemSetupTableColumnKey,
	ItemStatus,
	ItemTableColumnKey,
	ItemTrackingType,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

export const ItemsHref = "/maintenance/item-management/items";
export const ItemCategoryHref = "/maintenance/item-management/item-category";
export const ItemSubcategoryHref =
	"/maintenance/item-management/item-subcategory";
export const ItemTypeHref = "/maintenance/item-management/item-type";
export const ItemSubtypeHref = "/maintenance/item-management/item-subtype";

export const ItemStatusOptions: ItemStatus[] = ["Active", "Inactive"];

export const ItemTrackingTypeOptions: ItemTrackingType[] = [
	"Inventory",
	"Non-Inventory",
	"Service",
];

export const ItemUomOptions = ["PC", "BOX", "SET", "REAM", "ROLL"] as const;

export const ItemsTablePaginationStorageKey = "maintenance.item-management.items";

export const ItemSetupTablePaginationStorageKeys: Record<ItemSetupKind, string> = {
	category: "maintenance.item-management.category",
	subcategory: "maintenance.item-management.subcategory",
	type: "maintenance.item-management.type",
	subtype: "maintenance.item-management.subtype",
};

export const ItemsTableColumns: Array<
	| {
			key: ItemTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "code", label: "Item Code", className: "w-[10rem]" },
	{ key: "name", label: "Item", className: "w-[18rem]" },
	{ key: "category", label: "Category", className: "w-[12rem]" },
	{ key: "type", label: "Type", className: "w-[12rem]" },
	{ key: "trackingType", label: "Tracking", className: "w-[11rem]" },
	{ key: "supportsBundle", label: "Bundle", className: "w-[8rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem]" },
];

export const ItemSetupTableColumns: Array<
	| {
			key: ItemSetupTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "code", label: "Code", className: "w-[11rem]" },
	{ key: "name", label: "Name", className: "w-[18rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem]" },
];

export const ItemSetupConfigByKind: Record<
	ItemSetupKind,
	{
		href: string;
		title: string;
		singularTitle: string;
		description: string;
		eyebrow: string;
	}
> = {
	category: {
		href: ItemCategoryHref,
		title: "Category",
		singularTitle: "Item Category",
		description: "Maintain item categories used to group inventory records.",
		eyebrow: "Item setup",
	},
	subcategory: {
		href: ItemSubcategoryHref,
		title: "Sub Category",
		singularTitle: "Item Sub Category",
		description: "Maintain sub categories for finer item grouping.",
		eyebrow: "Item setup",
	},
	type: {
		href: ItemTypeHref,
		title: "Item Type",
		singularTitle: "Item Type",
		description: "Maintain item type classifications for item records.",
		eyebrow: "Item setup",
	},
	subtype: {
		href: ItemSubtypeHref,
		title: "Sub Item Type",
		singularTitle: "Sub Item Type",
		description: "Maintain subtype classifications under item types.",
		eyebrow: "Item setup",
	},
};

export const ItemsFormPageCopy = {
	add: {
		title: "Add Item",
		description:
			"Create an item master record and define bundle components when this item is sold or issued as a bundle.",
	},
	edit: {
		title: "Edit Item",
		description:
			"Update item master data, classification, tracking, and bundle components.",
	},
	view: {
		title: "Item",
		description:
			"Review item master information and bundle composition details.",
	},
} as const;

