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

export const TransactionTypeDefaultStatus: TransactionTypeStatus = "Active";

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

export const TransactionTypeModuleDescriptions = {
	GI: "Issues goods out of inventory.",
	GR: "Receives goods into inventory.",
} as const;

export const TransactionTypeNamePlaceholder =
	"Enter inventory transaction type";

export const TransactionTypeFieldClassName =
	"min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-not-allowed disabled:bg-darknavy/5 read-only:bg-darknavy/[0.03]";

export const TransactionTypeAccountTitles = {
	accountsPayableTrade: "Accounts Payable - Trade",
	accountsReceivablesOthers: "Accounts Receivables - Others",
	badOrderExpense: "Bad Order Expense",
	costOfSalesMerchandise: "Cost of Sales - Merchandise",
	expenseOperatingSupplies: "Expense - Operating Supplies",
	inventoryMerchandise: "Inventory - Merchandise",
	salesReturnsAndAllowances: "Sales Returns and Allowances",
	spoilageExpense: "Spoilage Expense",
} as const;

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
			"Review the selected goods movement and account mapping for this inventory transaction type.",
	},
} as const;
