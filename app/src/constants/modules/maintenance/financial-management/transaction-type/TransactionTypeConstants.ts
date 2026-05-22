import type { TransactionTypeStatus } from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export const TransactionTypeHref =
	"/maintenance/financial-management/transaction-type";

export const TransactionTypeStatusOptions: TransactionTypeStatus[] = [
	"Active",
	"Inactive",
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
