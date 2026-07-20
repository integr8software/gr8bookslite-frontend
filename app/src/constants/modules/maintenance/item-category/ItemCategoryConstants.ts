import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
	ItemCategoryAccountingSetup,
	ItemCategoryTableRowData,
	ItemCategoryTableColumnKey,
	ItemStatus,
} from "@/app/src/types/modules/maintenance/item-category/ItemCategoryTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const ItemCategoryHref = MODULE_ROUTE_MAP.IC;

export const ItemCategoryApiPath = "/maintenance/item-categories";

export const ItemCategoryPaginationStorageKey =
	"maintenance.item-category";

export const ItemCategoryTablePreferencesStorageKey =
	"gr8booksneo:item-category:table-preferences";
export const ItemCategoryTablePreferencesModuleKey =
	"maintenance:item-category";

export const ItemCategoryUnassignedRecordId = "item-category-unassigned";

export const ItemStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly ItemStatus[];

export const ItemCategoryAccountingStatusOptions = [
	"Configured",
	"Inherited",
] as const;

export const ItemCategoryAccountingAccountOptions = [
	"Inventory - Merchandise",
	"Inventory - Supplies",
	"Inventory - Finished Goods",
	"Sales - Merchandise",
	"Sales - Services",
	"Cost of Sales - Merchandise",
	"Expense - Operating Supplies",
] as const;

export const ItemCategorySystemDefaultAccountingSetup: ItemCategoryAccountingSetup =
	{
		inventoryAccount: "Inventory - Merchandise",
		salesAccount: "Sales - Merchandise",
		costOfSalesAccount: "Cost of Sales - Merchandise",
		expenseAccount: "Expense - Operating Supplies",
	};

export const ItemCategoryTableColumns: Array<
	| {
			key: ItemCategoryTableColumnKey;
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
		className: "w-[12rem] text-center",
	},
	{ key: "status", label: "Status", className: "w-[8rem] text-center" },
	{ key: "createdBy", label: "Created By", className: "w-[12rem]" },
	{ key: "createdAt", label: "Date Created", className: "w-[14rem]" },
	{ key: "updatedBy", label: "Updated By", className: "w-[12rem]" },
	{ key: "updatedAt", label: "Date Modified", className: "w-[14rem]" },
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
];

export const ItemCategoryDefaultColumnOrder = ItemCategoryTableColumns.map(
	(column) => ("key" in column ? column.key : "actions"),
);
export const ItemCategoryDefaultColumnVisibility: VisibilityState = {
	createdBy: false,
	createdAt: false,
	parentName: false,
	updatedBy: false,
	updatedAt: false,
};
export const ItemCategoryDefaultSorting: SortingState = [
	{ id: "name", desc: false },
];
export const ItemCategoryExportColumns: ModuleTableExportColumn<ItemCategoryTableRowData>[] =
	[
		{
			header: "Category Name",
			id: "name",
			value: (row) => row.record.name,
		},
		{
			header: "Parent Category",
			id: "parentName",
			value: "parentName",
		},
		{
			header: "Path",
			id: "pathName",
			value: "pathName",
		},
		{
			header: "Accounting Setup",
			id: "accountingSetupStatus",
			value: "accountingSetupStatus",
		},
		{
			header: "Status",
			id: "status",
			value: (row) => row.record.status,
		},
		{
			header: "Created By",
			id: "createdBy",
			value: (row) => row.record.createdBy ?? "",
		},
		{
			header: "Date Created",
			id: "createdAt",
			value: (row) => row.record.createdAt ?? "",
		},
		{
			header: "Updated By",
			id: "updatedBy",
			value: (row) => row.record.updatedBy ?? "",
		},
		{
			header: "Date Modified",
			id: "updatedAt",
			value: (row) => row.record.updatedAt ?? "",
		},
		{
			header: "Allow Subcategories",
			id: "allowSubCategory",
			value: (row) => (row.record.allowSubCategory === false ? "No" : "Yes"),
		},
		{
			header: "Used By Items",
			id: "usedByItemCount",
			value: "usedByItemCount",
		},
	];

export function getItemCategoryTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 8) return "min-w-[118rem]";
	if (visibleColumnCount >= 6) return "min-w-[96rem]";
	if (visibleColumnCount >= 5) return "min-w-[78rem]";
	if (visibleColumnCount === 4) return "min-w-[66rem]";
	return "min-w-[54rem]";
}
