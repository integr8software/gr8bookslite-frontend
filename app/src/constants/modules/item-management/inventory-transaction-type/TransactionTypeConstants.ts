import type { SortingState, VisibilityState } from "@tanstack/react-table";
import type {
	TransactionTypeStatus,
	TransactionTypeTableRecord,
	TransactionTypeTableColumnKey,
} from "@/app/src/types/modules/item-management/inventory-transaction-type/TransactionTypeTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

export const TransactionTypeHref =
	"/maintenance/inventory-transaction-type";

export const TransactionTypeParentLabel = "Maintenance";

export const TransactionTypeTitle = "Inventory Transaction Type";

export const TransactionTypeDescription =
	"Maintain inventory transaction types used to classify goods receipt and goods issue movements.";

export const TransactionTypeDrawerFormId =
	"inventory-transaction-type-drawer-form";

export const TransactionTypePaginationStorageKey =
	"maintenance:inventory-transaction-type";
export const TransactionTypeTablePreferencesStorageKey =
	"gr8booksneo:inventory-transaction-type:table-preferences";
export const TransactionTypeTablePreferencesModuleKey =
	"maintenance:inventory-transaction-type";

export const TransactionTypeStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly TransactionTypeStatus[];

export const TransactionTypeModuleOptions = [
	{
		label: "Goods Issue",
		value: "GI",
	},
	{
		label: "Goods Receipt",
		value: "GR",
	},
] as const;

export const TransactionTypeTableColumns: Array<
	| {
			className: string;
			key: TransactionTypeTableColumnKey;
			label: string;
	  }
	| {
			className: string;
			label: string;
	  }
> = [
	{
		key: "name",
		label: "Name",
		className: "w-[18%]",
	},
	{
		key: "description",
		label: "Description",
		className: "w-[28%]",
	},
	{
		key: "moduleLabel",
		label: "Module",
		className: "w-[18%]",
	},
	{
		key: "accountLabel",
		label: "Account Title",
		className: "w-[22%]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[10%]",
	},
	{
		label: "Action",
		className: "w-[12%] text-center",
	},
] as const;

export const TransactionTypeDefaultColumnOrder =
	TransactionTypeTableColumns.map((column) =>
		"key" in column ? column.key : "actions",
	);
export const TransactionTypeDefaultColumnVisibility: VisibilityState = {};
export const TransactionTypeDefaultSorting: SortingState = [
	{ id: "name", desc: false },
];

export const TransactionTypeExportColumns: ModuleTableExportColumn<TransactionTypeTableRecord>[] =
	TransactionTypeTableColumns.flatMap((column) =>
		"key" in column
			? [
					{
						header: column.label,
						id: column.key satisfies TransactionTypeTableColumnKey,
						value: column.key,
					},
				]
			: [],
	);

export const TransactionTypeActionCopy = {
	add: {
		title: "Add Inventory Transaction Type",
		description:
			"Create an inventory movement classification and map it to goods receipt or goods issue.",
	},
	edit: {
		title: "Edit Inventory Transaction Type",
		description:
			"Update the inventory movement details, module availability, and account mapping.",
	},
	view: {
		title: "View Inventory Transaction Type",
		description:
			"Review the inventory transaction type configuration before making changes.",
	},
} as const;
