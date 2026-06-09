import type {
	TransactionTypeStatus,
	TransactionTypeTableColumnKey,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export const TransactionTypeHref =
	"/maintenance/transaction-type";

export const TransactionTypePaginationStorageKey =
	"transaction-type-table-pagination";

export const TransactionTypeStatusOptions: TransactionTypeStatus[] = [
	"Active",
	"Inactive",
];

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
		label: "Actions",
		className: "w-[8%] text-right",
	},
];

export const TransactionTypeActionCopy = {
	add: {
		title: "Add Transaction Type",
		description:
			"Create a transaction type and map it to the right module and chart account.",
	},
	edit: {
		title: "Edit Transaction Type",
		description:
			"Update the transaction type details, module availability, and account mapping.",
	},
	view: {
		title: "View Transaction Type",
		description:
			"Review the transaction type configuration before making changes.",
	},
} as const;
