import type {
	ItemCategoryAccountingSetup,
	ItemCategoryClassificationTableColumnKey,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";

export const ItemCategoryHref = "/maintenance/item-category";

export const ItemCategoryClassificationPaginationStorageKey =
	"maintenance.item-category.classification";

export const ItemCategoryUnassignedRecordId = "item-category-unassigned";

export const ItemStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly ItemStatus[];

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
