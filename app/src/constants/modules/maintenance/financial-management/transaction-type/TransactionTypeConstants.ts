import type {
	TransactionTypeStatus,
	TransactionTypeTableColumnKey,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export const TransactionTypeHref =
	"/maintenance/financial-management/transaction-type";

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
		key: "type",
		label: "Type",
		className: "w-[10rem]",
	},
	{
		key: "description",
		label: "Description",
		className: "min-w-[16rem]",
	},
	{
		key: "accountCode",
		label: "Account Code",
		className: "w-[10rem]",
	},
	{
		key: "accountTitle",
		label: "Account Title",
		className: "min-w-[14rem]",
	},
	{
		key: "status",
		label: "Status",
		className: "w-[9rem]",
	},
	{
		label: "Actions",
		className: "w-[10rem] text-right",
	},
];

export const TransactionTypeActionCopy = {
	add: {
		title: "Add Transaction Type",
		description:
			"Create a new transaction type for financial posting and ledger mapping.",
	},
	edit: {
		title: "Edit Transaction Type",
		description:
			"Update the transaction type details used for posting and reporting.",
	},
	view: {
		title: "View Transaction Type",
		description:
			"Review the transaction type configuration before making changes.",
	},
} as const;
