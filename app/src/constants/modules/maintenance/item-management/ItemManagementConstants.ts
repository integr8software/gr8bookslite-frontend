import type {
	ItemSetupKind,
	ItemSetupTableColumnKey,
	ItemStatus,
	ItemTableColumnKey,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { SystemUomOptions, SystemUomRows } from "@/app/src/data/shared/UomData";

export const ItemsHref = "/maintenance/item-management/items";
export const ItemCategoryHref = "/maintenance/item-management/item-category";
export const ItemSubcategoryHref =
	"/maintenance/item-management/item-subcategory";
export const ItemTypeHref = "/maintenance/item-management/item-type";
export const ItemSubtypeHref = "/maintenance/item-management/item-subtype";

export const ItemStatusOptions: ItemStatus[] = ["Active", "Inactive"];

export const ItemUomDictionary = SystemUomRows;
export const ItemUomOptions = SystemUomOptions;

export const ItemSetupAllParentsValue = "__all_parents__";
export const ItemSetupAllParentsRecordId = "item-setup-all-parents";

export const ItemSupplierOptions = [
	"TechSource Inc.",
	"Global Supply Co.",
	"Prime Distributors",
	"Northline Trading",
] as const;

export const ItemWarehouseOptions = [
	"Main Warehouse",
	"North Branch Warehouse",
	"South Satellite Storage",
] as const;

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
	{ key: "skuCode", label: "SKU", className: "w-[10rem]" },
	{ key: "name", label: "Item", className: "w-[16rem]" },
	{ key: "category", label: "Category", className: "w-[12rem]" },
	{ key: "type", label: "Type", className: "w-[12rem]" },
	{ key: "uom", label: "UOM", className: "w-[8rem]" },
	{ key: "sellingPrice", label: "Selling Price", className: "w-[10rem]" },
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
	{ key: "recordKindLabel", label: "Level", className: "w-[10rem]" },
	{ key: "appliesToLabel", label: "Applies To", className: "w-[18rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem]" },
];

export const ItemSetupChildKindByKind: Partial<
	Record<ItemSetupKind, ItemSetupKind>
> = {
	category: "subcategory",
	type: "subtype",
};

export const ItemSetupParentKindByKind: Partial<
	Record<ItemSetupKind, ItemSetupKind>
> = {
	subcategory: "category",
	subtype: "type",
};

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
		description:
			"Maintain item categories and the sub categories that can be assigned to one, many, or all categories.",
		eyebrow: "Item setup",
	},
	subcategory: {
		href: ItemSubcategoryHref,
		title: "Sub Category",
		singularTitle: "Item Sub Category",
		description:
			"Maintain sub categories and choose which categories can use them.",
		eyebrow: "Item setup",
	},
	type: {
		href: ItemTypeHref,
		title: "Item Type",
		singularTitle: "Item Type",
		description:
			"Maintain item type classifications and the sub item types that can be reused across types.",
		eyebrow: "Item setup",
	},
	subtype: {
		href: ItemSubtypeHref,
		title: "Sub Item Type",
		singularTitle: "Sub Item Type",
		description:
			"Maintain sub item types and choose which item types can use them.",
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
