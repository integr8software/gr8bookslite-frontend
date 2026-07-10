export type ModuleChartAccount = {
	id: string;
	accountNumber: string;
	accountName: string;
	accountType: string;
	statementGroup: string;
	statementSection: string;
	normalBalance: "Debit" | "Credit";
	accountCategory: string;
	description: string;
	status: "Active" | "Inactive";
	children?: ModuleChartAccount[];
};

export type ModuleChartAccountScope = {
	moduleKey?: string;
	purpose?: string;
};

const ModuleChartAccountAccess: Record<string, Record<string, string[]>> = {
	"maintenance-discount-management": {
		default: [
			"accounts-receivable-trade",
			"accounts-receivable-others",
			"sales-discounts",
			"sales-returns",
			"expense-operating-supplies",
		],
	},
	"maintenance-item-category": {
		costOfSalesAccount: [
			"cost-of-sales-merchandise",
			"cost-of-sales-services",
		],
		discountAccount: [
			"sales-discounts",
			"sales-returns",
		],
		expenseAccount: [
			"expense-operating-supplies",
			"office-supplies-expense",
			"bad-order-expense",
			"spoilage-expense",
		],
		inventoryAccount: [
			"inventory-merchandise",
			"inventory-supplies",
			"inventory-finished-goods",
			"inventory-raw-materials",
		],
		purchaseAccount: [
			"purchases-merchandise",
			"freight-in",
			"accounts-payable-trade",
		],
		salesAccount: [
			"sales-merchandise",
			"sales-services",
		],
	},
	"maintenance-transaction-type": {
		default: [
			"cash-on-hand",
			"petty-cash-fund",
			"cash-in-bank",
			"accounts-receivable-trade",
			"accounts-receivable-others",
			"advances-to-officers-and-employees",
			"advances-to-suppliers",
			"accounts-payable-trade",
			"accounts-payable-others",
			"inventory-merchandise",
			"inventory-supplies",
			"cost-of-sales-merchandise",
			"expense-operating-supplies",
		],
	},
	"maintenance-party-management": {
		default: [
			"accounts-receivable-trade",
			"accounts-receivable-others",
			"advances-to-suppliers",
			"advances-to-officers-and-employees",
			"other-advances",
			"accounts-payable-trade",
			"accounts-payable-others",
			"other-payables",
			"accrued-expenses",
		],
	},
};

export const ModuleChartAccounts: ModuleChartAccount[] = [
	createAccount(
		"cash-on-hand",
		"1010101001",
		"Cash on Hand",
		"Assets",
		"Cash on Hand",
	),
	createAccount(
		"petty-cash-fund",
		"1010101002",
		"Petty Cash Fund",
		"Assets",
		"Cash on Hand",
	),
	createAccount(
		"cash-in-bank",
		"1010102001",
		"Cash in Bank",
		"Assets",
		"Cash in Bank",
	),
	createAccount(
		"accounts-receivable-trade",
		"1010103001",
		"Accounts Receivables - Trade",
		"Assets",
		"Accounts Receivables",
	),
	createAccount(
		"accounts-receivable-others",
		"1010103002",
		"Accounts Receivables - Others",
		"Assets",
		"Accounts Receivables",
	),
	createAccount(
		"advances-to-suppliers",
		"1010103003",
		"Advances To Suppliers",
		"Assets",
		"Accounts Receivables",
	),
	createAccount(
		"advances-to-officers-and-employees",
		"1010103004",
		"Advances To Officers and Employees",
		"Assets",
		"Accounts Receivables",
	),
	createAccount(
		"other-advances",
		"1010103005",
		"Other Advances",
		"Assets",
		"Accounts Receivables",
	),
	createAccount(
		"inventory-merchandise",
		"1010400001",
		"Inventory - Merchandise",
		"Assets",
		"Inventory",
	),
	createAccount(
		"inventory-supplies",
		"1010400002",
		"Inventory - Supplies",
		"Assets",
		"Inventory",
	),
	createAccount(
		"inventory-finished-goods",
		"1010400003",
		"Inventory - Finished Goods",
		"Assets",
		"Inventory",
	),
	createAccount(
		"inventory-raw-materials",
		"1010400004",
		"Inventory - Raw Materials",
		"Assets",
		"Inventory",
	),
	createAccount(
		"accounts-payable-trade",
		"2010001001",
		"Accounts Payable - Trade",
		"Liabilities",
		"Accounts Payables",
		"Credit",
	),
	createAccount(
		"accounts-payable-others",
		"2010001002",
		"Accounts Payable - Others",
		"Liabilities",
		"Accounts Payables",
		"Credit",
	),
	createAccount(
		"sss-contributions-payable",
		"2010001003",
		"SSS Contributions Payable",
		"Liabilities",
		"Accounts Payables",
		"Credit",
	),
	createAccount(
		"hdmf-contributions-payable",
		"2010001004",
		"HDMF Contributions Payable",
		"Liabilities",
		"Accounts Payables",
		"Credit",
	),
	createAccount(
		"phic-contributions-payable",
		"2010001005",
		"PHIC Contributions Payable",
		"Liabilities",
		"Accounts Payables",
		"Credit",
	),
	createAccount(
		"other-payables",
		"2010004001",
		"Other Payables",
		"Liabilities",
		"Other Current Liabilities",
		"Credit",
	),
	createAccount(
		"accrued-expenses",
		"2010004002",
		"Accrued Expenses",
		"Liabilities",
		"Other Current Liabilities",
		"Credit",
	),
	createAccount(
		"sales-merchandise",
		"4010100001",
		"Sales - Merchandise",
		"Revenues",
		"Revenue",
		"Credit",
	),
	createAccount(
		"sales-services",
		"4010100002",
		"Sales - Services",
		"Revenues",
		"Revenue",
		"Credit",
	),
	createAccount(
		"sales-discounts",
		"4010200001",
		"Sales Discounts",
		"Revenues",
		"Revenue",
		"Debit",
	),
	createAccount(
		"sales-returns",
		"4010200002",
		"Sales Returns and Allowances",
		"Revenues",
		"Revenue",
		"Debit",
	),
	createAccount(
		"cost-of-sales-merchandise",
		"5010100001",
		"Cost of Sales - Merchandise",
		"Expenses",
		"Cost of Sales",
	),
	createAccount(
		"cost-of-sales-services",
		"5010100002",
		"Cost of Sales - Services",
		"Expenses",
		"Cost of Sales",
	),
	createAccount(
		"purchases-merchandise",
		"5010200001",
		"Purchases - Merchandise",
		"Expenses",
		"Cost of Sales",
	),
	createAccount(
		"freight-in",
		"5010200002",
		"Freight In",
		"Expenses",
		"Cost of Sales",
	),
	createAccount(
		"expense-operating-supplies",
		"5020100001",
		"Expense - Operating Supplies",
		"Expenses",
		"Operating Expense",
	),
	createAccount(
		"office-supplies-expense",
		"5020100002",
		"Office Supplies Expense",
		"Expenses",
		"Operating Expense",
	),
	createAccount(
		"bad-order-expense",
		"5020200001",
		"Bad Order Expense",
		"Expenses",
		"Operating Expense",
	),
	createAccount(
		"spoilage-expense",
		"5020200002",
		"Spoilage Expense",
		"Expenses",
		"Operating Expense",
	),
];

export function getModuleChartAccounts(scope: ModuleChartAccountScope = {}) {
	const flatAccounts = flattenModuleChartAccounts(ModuleChartAccounts);
	const allowedAccountIds = getAllowedAccountIds(scope);

	if (!allowedAccountIds) {
		return flatAccounts;
	}

	return flatAccounts.filter((account) => allowedAccountIds.has(account.id));
}

export function findModuleChartAccount(
	value: string,
	accounts: ModuleChartAccount[] = getModuleChartAccounts(),
) {
	return flattenModuleChartAccounts(accounts).find(
		(account) =>
			account.id === value ||
			account.accountNumber === value ||
			account.accountName === value,
	);
}

function getAllowedAccountIds({ moduleKey, purpose }: ModuleChartAccountScope) {
	if (!moduleKey) {
		return undefined;
	}

	const moduleAccess = ModuleChartAccountAccess[moduleKey];

	if (!moduleAccess) {
		return new Set<string>();
	}

	const accountIds = moduleAccess[purpose ?? "default"] ?? moduleAccess.default;

	return accountIds ? new Set(accountIds) : new Set<string>();
}

function flattenModuleChartAccounts(
	accounts: ModuleChartAccount[],
): ModuleChartAccount[] {
	return accounts.flatMap((account) => [
		account,
		...(account.children ? flattenModuleChartAccounts(account.children) : []),
	]);
}

function createAccount(
	id: string,
	accountNumber: string,
	accountName: string,
	accountType: string,
	accountCategory: string,
	normalBalance: "Debit" | "Credit" = "Debit",
): ModuleChartAccount {
	const isIncomeStatement =
		accountType === "Revenues" || accountType === "Expenses";

	return {
		id,
		accountNumber,
		accountName,
		accountType,
		statementGroup: isIncomeStatement ? "Income Statement" : "Balance Sheet",
		statementSection: accountCategory,
		normalBalance,
		accountCategory,
		description: accountName,
		status: "Active",
	};
}
