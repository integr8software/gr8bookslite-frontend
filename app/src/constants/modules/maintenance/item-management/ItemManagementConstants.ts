import type {
	ItemCategoryAccountingSetup,
	ItemCategoryClassificationTableColumnKey,
	ItemStatus,
	ItemTableColumnKey,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { SystemUomOptions, SystemUomRows } from "@/app/src/data/shared/uom/UomData";

export const ItemsHref = "/maintenance/item-management/items";
export const ItemCategoryHref = "/maintenance/item-management/item-category";

export const ItemStatusOptions: ItemStatus[] = ["Active", "Inactive"];

export const ItemUomDictionary = SystemUomRows;
export const ItemUomOptions = SystemUomOptions;

export const ItemCategoryClassificationPaginationStorageKey =
	"maintenance.item-management.item-category.classification";

export const ItemCategoryUnassignedRecordId = "item-category-unassigned";

export const ItemCategoryAccountingAccountOptions = [
	"Inventory - Merchandise",
	"Inventory - Supplies",
	"Inventory - Finished Goods",
	"Sales - Merchandise",
	"Sales - Services",
	"Cost of Sales - Merchandise",
	"Sales Discounts",
	"Purchases - Merchandise",
	"Expense - Operating Supplies",
] as const;

export const ItemCategorySystemDefaultAccountingSetup: ItemCategoryAccountingSetup =
	{
		inventoryAccount: "Inventory - Merchandise",
		salesAccount: "Sales - Merchandise",
		costOfSalesAccount: "Cost of Sales - Merchandise",
		discountAccount: "Sales Discounts",
		purchaseAccount: "Purchases - Merchandise",
		expenseAccount: "Expense - Operating Supplies",
	};

export const ItemWarehouseOptions = [
	"Main Warehouse",
	"North Warehouse",
] as const;

export const ItemsTablePaginationStorageKey = "maintenance.item-management.items";

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
	{ key: "name", label: "Item Name", className: "w-[18rem]" },
	{ key: "category", label: "Category", className: "w-[14rem]" },
	{ key: "uom", label: "UOM", className: "w-[8rem]" },
	{ key: "costPrice", label: "Cost", className: "w-[10rem]" },
	{ key: "sellingPrice", label: "Selling Price", className: "w-[10rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
	{ id: "actions", label: "Actions", className: "w-[10rem] text-center" },
];

export const ItemCategoryClassificationTableColumns: Array<
	| {
			key: ItemCategoryClassificationTableColumnKey;
			label: string;
			className: string;
	  }
	| {
			id: "actions";
			label: string;
			className: string;
	  }
> = [
	{ key: "name", label: "Category Name", className: "w-[34rem]" },
	{ key: "parentName", label: "Parent Category", className: "w-[12rem]" },
	{
		key: "accountingSetupStatus",
		label: "Accounting Setup",
		className: "w-[11rem]",
	},
	{ key: "status", label: "Status", className: "w-[8rem]" },
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
];

export const ItemsFormPageCopy = {
	add: {
		title: "Add Item",
		description:
			"Create an item master record for products, services, assets, and tracked inventory.",
	},
	edit: {
		title: "Edit Item",
		description:
			"Update classification, behavior, supplier, inventory, pricing, and tax details.",
	},
	view: {
		title: "Item",
		description:
			"Review item master information, supplier links, and inventory setup.",
	},
} as const;
