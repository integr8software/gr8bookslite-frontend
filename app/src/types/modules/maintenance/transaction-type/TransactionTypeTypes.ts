export type TransactionTypeStatus = "Active" | "Inactive";

export type TransactionType = {
	id: string;
	name: string;
	description: string;
	moduleId?: string;
	moduleName?: string;
	moduleIds: string[];
	moduleNames: string[];
	status: TransactionTypeStatus;
	accountId?: string;
	accountCode?: string;
	accountTitle?: string;
};

export type TransactionTypeFormValues = {
	name: string;
	description: string;
	moduleIds: string[];
	status: TransactionTypeStatus;
	accountId: string;
};

export type TransactionTypeFormErrors = Partial<
	Record<keyof TransactionTypeFormValues, string>
>;

export type TransactionTypeActionMode = "add" | "edit" | "view";

export type TransactionTypeTableColumnKey =
	| "name"
	| "description"
	| "accountLabel"
	| "moduleLabel"
	| "status";

export type TransactionTypeTableRecord = TransactionType & {
	accountLabel: string;
	moduleLabel: string;
};
