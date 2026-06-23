export type BankMasterfileStatus = "Active" | "Inactive";

export type BankMasterfile = {
	id: string;
	accountCode: string;
	bankName: string;
	branch: string;
	accountNumber: string;
	accountName: string;
	accountType: string;
	currencyCode: string;
	currencyExchangeRate: string;
	isDefault: boolean;
	seriesStart: string;
	seriesEnd: string;
	seriesDigits: string;
	status: BankMasterfileStatus;
	createdAt?: string;
	updatedAt?: string;
};

export type BankMasterfileFormValues = {
	bankName: string;
	branch: string;
	accountNumber: string;
	accountType: string;
	currencyCode: string;
	currencyExchangeRate: string;
	isDefault: boolean;
	seriesStart: string;
	seriesEnd: string;
	seriesDigits: string;
	status: BankMasterfileStatus;
};

export type BankMasterfileFormErrors = Partial<
	Record<keyof BankMasterfileFormValues, string>
>;

export type BankMasterfileActionMode = "add" | "edit" | "view";

export type BankMasterfileTableColumnKey =
	| "bankName"
	| "branch"
	| "accountNumber"
	| "accountName"
	| "accountCode"
	| "currencyCode"
	| "isDefault"
	| "status"
	| "createdAt"
	| "updatedAt";