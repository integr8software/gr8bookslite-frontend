export type TransactionNumberModuleCode =
	| "party-management"
	| "item-management"
	| "official-receipt"
	| "collection-receipt"
	| "acknowledgement-receipt"
	| "provisional-receipt"
	| "bank-reconciliation"
	| "product-distribution-center-warehouse"
	| "disbursement-voucher"
	| "cash-advance"
	| "cash-advance-multiple-entry"
	| "petty-cash-voucher"
	| "petty-cash-fund"
	| "petty-cash-fund-replenishment"
	| "petty-cash-advance"
	| "petty-cash-advance-replenishment"
	| "request-for-payment"
	| "advances-to-supplier"
	| "account-payable-voucher"
	| "journal-voucher"
	| "debit-memo"
	| "credit-memo"
	| "sales-quotation"
	| "sales-order"
	| "sales-invoice"
	| "billing"
	| "billing-statement"
	| "billing-invoice"
	| "service-invoice"
	| "cash-sales-invoice"
	| "sales-journal"
	| "statement-of-account"
	| "material-request"
	| "receiving-report"
	| "goods-receipt"
	| "goods-issue"
	| "delivery-receipt"
	| "pick-list"
	| "purchasing-request"
	| "canvass-form"
	| "purchase-order"
	| "purchase-journal"
	| "fixed-assets";

export type TransactionNumberInputMode = "Auto" | "Manual";

export type TransactionNumberScope = "all" | "branch" | "shared";

export type TransactionNumberStatus = "Active" | "Inactive";

export type TransactionNumberSetupRecord = {
	id: string;
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
	description: string;
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
	| "inputMode"
	| "scope"
	| "branchScope"
	| "prefix"
	| "currentNumber"
	| "nextNumber"
	| "status";
