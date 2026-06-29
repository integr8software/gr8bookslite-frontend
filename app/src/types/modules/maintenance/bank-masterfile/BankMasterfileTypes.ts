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

export type BankImportColumnId = keyof BankMasterfileFormValues;

export type BankImportCellErrors = Partial<
	Record<BankImportColumnId, string[]>
>;

export type BankImportPreviewRow = {
	cellErrors: BankImportCellErrors;
	id: string;
	rowErrors: string[];
	rowNumber: number;
	values: BankMasterfileFormValues;
};

export type BankImportProgress = {
	imported: number;
	total: number;
};

export type BankImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = BankImportProgress;
export type ImportMode = BankImportMode;
