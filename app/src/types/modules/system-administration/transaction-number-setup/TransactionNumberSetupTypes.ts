export type TransactionNumberModuleCode = string;

export type TransactionNumberInputMode = "Auto" | "Manual";

export type TransactionNumberScope = "all" | "branch" | "shared";

export type TransactionNumberStatus = "Active" | "Inactive";

export type TransactionNumberSetupRecord = {
	id: string;
	permissionId: number;
	moduleCode: TransactionNumberModuleCode;
	moduleName: string;
	inputMode: TransactionNumberInputMode;
	prefix: string;
	padding: number;
	startingNumber: number;
	currentNumber: number;
	scope: TransactionNumberScope;
	branchIds: string[];
	status: TransactionNumberStatus;
	lastGeneratedNumber?: string;
	lastGeneratedAt?: string;
};

export type TransactionNumberSetupFormValues = {
	moduleCode: TransactionNumberModuleCode | "";
	inputMode: TransactionNumberInputMode;
	prefix: string;
	padding: number;
	startingNumber: number;
	currentNumber: number;
	scope: TransactionNumberScope;
	branchIds: string[];
	status: TransactionNumberStatus;
};

export type TransactionNumberSetupFormErrors = Partial<
	Record<keyof TransactionNumberSetupFormValues, string>
>;

export type TransactionNumberUsageLog = {
	id: string;
	setupId: string;
	moduleCode: TransactionNumberModuleCode;
	transactionNumber: string;
	runningNumber: number;
	branchId: string;
	status: "Reserved" | "Committed" | "Voided";
	createdAt: string;
};

export type GeneratedTransactionNumber = {
	record: TransactionNumberSetupRecord;
	runningNumber: number;
	transactionNumber: string;
	usageLog: TransactionNumberUsageLog;
};

export type TransactionNumberSetupActionMode = "add" | "edit" | "view";

export type TransactionNumberSetupTableColumnKey =
	| "moduleName"
	| "inputMode"
	| "scope"
	| "branchScope"
	| "prefix"
	| "currentNumber"
	| "nextNumber"
	| "status";
