import type {
	AccountCategory,
	AccountStatus,
	AccountType,
	NormalBalance,
	StatementGroup,
} from "@/app/src/types/modules/charts-of-accounts/ChartsOfAccountsTypes";

export const ChartsOfAccountsHref =
	"/maintenance/financial-management/charts-of-accounts";

export const AccountTypes: AccountType[] = [
	"Asset",
	"Liability",
	"Equity",
	"Revenue",
	"Expense",
];

export const StatementGroups: StatementGroup[] = [
	"Balance Sheet",
	"Income Statement",
	"Cash Flow",
];

export const AccountStatuses: AccountStatus[] = ["Active", "Inactive"];

export const NormalBalances: NormalBalance[] = ["Debit", "Credit"];

export const AccountCategories: AccountCategory[] = [
	"Header",
	"Cash in Bank",
	"Cash on Hand",
	"Receivable",
	"Inventory",
	"Payable",
	"Loan",
	"Revenue",
	"Cost of Sales",
	"Operating Expense",
	"Other",
];

export const StatementSections = [
	"Current Assets",
	"Non-current Assets",
	"Current Liabilities",
	"Non-current Liabilities",
	"Owner's Equity",
	"Operating Revenue",
	"Cost of Goods Sold",
	"Operating Expenses",
	"Financing Activities",
];

export const AccountTabs = [
	"All Accounts",
	"Balance Sheet",
	"Income Statement",
	"Cash Flow",
	"Inactive Accounts",
] as const;

export type AccountTab = (typeof AccountTabs)[number];
