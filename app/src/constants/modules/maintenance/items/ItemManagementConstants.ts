import type {
	ItemCategoryAccountingSetup,
	ItemCategoryClassificationTableColumnKey,
	ItemPerishability,
	ItemRecord,
	ItemStatus,
	ItemTableColumnKey,
	ItemTaxTreatment,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { SystemUomOptions, SystemUomRows } from "@/app/src/data/shared/uom/UomData";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const ItemsHref = MODULE_ROUTE_MAP.I;
export const ItemCategoryHref = MODULE_ROUTE_MAP.IC;

export const ItemStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly ItemStatus[];

export const ItemPerishabilityOptions = [
	"Non Perishable",
	"Perishable",
] as const satisfies readonly ItemPerishability[];

export const ItemTaxTreatmentOptions = [
	"VAT Exclusive",
	"VAT Inclusive",
	"VAT Exempt",
	"Zero Rated",
	"Non-VAT",
] as const satisfies readonly ItemTaxTreatment[];

export const ItemTaxTreatmentSelectOptions = [
	{ label: "VAT Exclusive (12%)", value: "VAT Exclusive" },
	{ label: "VAT Inclusive (12%)", value: "VAT Inclusive" },
	{ label: "VAT Exempt (0%)", value: "VAT Exempt" },
	{ label: "Zero Rated (0%)", value: "Zero Rated" },
	{ label: "Non-VAT (0%)", value: "Non-VAT" },
] as const satisfies ReadonlyArray<{
	label: string;
	value: ItemTaxTreatment;
}>;

export const VatExclusiveTaxMultiplier = 1.12;

export const ItemUomDictionary = SystemUomRows;
export const ItemUomOptions = SystemUomOptions;

export const ItemCategoryClassificationPaginationStorageKey =
	"maintenance.items.item-category.classification";

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

export const ItemsTablePaginationStorageKey = "maintenance.items.items";

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
	{ key: "status", label: "Status", className: "w-[9rem] text-center" },
	{ id: "actions", label: "Actions", className: "w-[10rem] text-center" },
];

export const ItemsExportColumns: ModuleTableExportColumn<ItemRecord>[] =
	ItemsTableColumns.flatMap((column) =>
		"key" in column
			? [
					{
						header: column.label,
						id: column.key,
						value: column.key,
					},
				]
			: [],
	);

export function getItemsTableMinWidthClassName(visibleColumnCount: number) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}

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
	{ key: "status", label: "Status", className: "w-[8rem] text-center" },
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
