export type TransactionTypeStatus = "Active" | "Inactive";

export type TransactionType = {
	id: string;
	type: string;
	description: string;
	accountCode: string;
	accountTitle: string;
	status: TransactionTypeStatus;
};

export type TransactionTypeFormValues = {
	type: string;
	description: string;
	accountCode: string;
	accountTitle: string;
	status: TransactionTypeStatus;
};

export type TransactionTypeFormErrors = Partial<
	Record<keyof TransactionTypeFormValues, string>
>;

export type TransactionTypeActionMode = "add" | "edit" | "view";
