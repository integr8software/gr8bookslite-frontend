export type TransactionNumberModuleCode = "DV" | "CR" | "JV" | "PR";

export type TransactionNumberScope = "all" | "branch" | "shared";

export type TransactionNumberStatus = "Active" | "Inactive";

export type TransactionNumberSetupRecord = {
	id: string;
	moduleCode: TransactionNumberModuleCode;
	moduleName: string;
	prefix: string;
	padding: number;
	startingNumber: number;
	currentNumber: number;
	scope: TransactionNumberScope;
	branchIds: string[];
	status: TransactionNumberStatus;
	description: string;
	lastGeneratedNumber?: string;
	lastGeneratedAt?: string;
};

export type TransactionNumberSetupFormValues = {
	moduleCode: TransactionNumberModuleCode | "";
	prefix: string;
	padding: number;
	startingNumber: number;
	currentNumber: number;
	scope: TransactionNumberScope;
	branchIds: string[];
	status: TransactionNumberStatus;
	description: string;
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
	| "scope"
	| "branchScope"
	| "prefix"
	| "currentNumber"
	| "nextNumber"
	| "status";

export type TransactionNumberDatabaseTable = {
	name: string;
	purpose: string;
	columns: string[];
};

export type TransactionNumberApiEndpoint = {
	method: "GET" | "POST" | "PATCH";
	path: string;
	purpose: string;
};
