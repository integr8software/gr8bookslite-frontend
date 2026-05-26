export type AccountType =
	| "Assets"
	| "Liabilities"
	| "Equity"
	| "Revenues"
	| "Expenses"
	| "Other Income/Expenses";

export type NormalBalance = "Debit" | "Credit";

export type AccountStatus = "Active" | "Inactive";

export type StatementGroup =
	| "Balance Sheet"
	| "Income Statement"
	| "Cash Flow";

export type AccountCategory =
	| "Header"
	| "Cash in Bank"
	| "Cash on Hand"
	| "Receivable"
	| "Inventory"
	| "Payable"
	| "Loan"
	| "Revenue"
	| "Cost of Sales"
	| "Operating Expense"
	| "Other";

export type BankDetails = {
	bankName: string;
	bankAccountNumber: string;
	branch: string;
	swiftCode: string;
	currency: string;
	accountType: string;
	openingBalance: string;
	openingBalanceDate: string;
	contactPerson: string;
	contactNumber: string;
};

export type BankDetailsKey = keyof BankDetails;

export type ChartAccount = {
	id: string;
	accountNumber: string;
	accountName: string;
	parentId: string | null;
	accountType: AccountType;
	statementGroup: StatementGroup;
	statementSection: string;
	normalBalance: NormalBalance;
	accountCategory: AccountCategory;
	description: string;
	status: AccountStatus;
	showInReports: boolean;
	bankDetails?: BankDetails;
	children?: ChartAccount[];
};

export type ChartAccountFormValues = Omit<ChartAccount, "id" | "children">;

export type FlattenedChartAccount = {
	account: ChartAccount;
	level: number;
};

export type FilterValue<TValue> = TValue | "All";

export type ChartAccountStructureFilter =
	| "All"
	| "With Submodules"
	| "Without Submodules";

export type ChartsOfAccountsActionMode = "add" | "edit" | "view";

export type ChartsOfAccountsFormTab = "Account Information" | "Bank Details";

export type ChartsOfAccountsTableColumnKey =
	| "accountNumber"
	| "accountName"
	| "accountType"
	| "statementGroup"
	| "statementSection"
	| "normalBalance"
	| "status";

export type SortDirection = "asc" | "desc";
