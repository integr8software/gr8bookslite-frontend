import type {
	TransactionType,
	TransactionTypeFormValues,
} from "@/app/src/types/modules/maintenance/financial-management/transaction-type/TransactionTypeTypes";

export const MockTransactionTypes: TransactionType[] = [
	{
		id: "transaction-type-1",
		type: "GR",
		description: "Sales Returns",
		accountCode: "4110300",
		accountTitle: "Sales Returns",
		status: "Active",
	},
	{
		id: "transaction-type-2",
		type: "GI",
		description: "Purchase Return",
		accountCode: "4101000",
		accountTitle: "Cost of Goods Sold",
		status: "Active",
	},
	{
		id: "transaction-type-3",
		type: "GI",
		description: "Loss",
		accountCode: "6211800",
		accountTitle: "Advertising Expenses",
		status: "Active",
	},
	{
		id: "transaction-type-4",
		type: "GI",
		description: "Bill of Materials",
		accountCode: "4101000",
		accountTitle: "Cost of Goods Sold",
		status: "Inactive",
	},
];

export const TransactionTypeInitialFormValues: TransactionTypeFormValues = {
	type: "",
	description: "",
	accountCode: "",
	accountTitle: "",
	status: "Active",
};

export function createTransactionTypeFormValues(
	transactionType: TransactionType,
): TransactionTypeFormValues {
	return {
		type: transactionType.type,
		description: transactionType.description,
		accountCode: transactionType.accountCode,
		accountTitle: transactionType.accountTitle,
		status: transactionType.status,
	};
}

export function createTransactionTypeFromForm(
	values: TransactionTypeFormValues,
): TransactionType {
	return {
		id: `transaction-type-${Date.now()}`,
		...values,
	};
}

export function updateTransactionTypeFromForm(
	transactionType: TransactionType,
	values: TransactionTypeFormValues,
): TransactionType {
	return {
		...transactionType,
		...values,
	};
}
