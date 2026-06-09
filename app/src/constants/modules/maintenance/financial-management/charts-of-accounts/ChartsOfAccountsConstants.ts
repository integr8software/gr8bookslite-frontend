import type {
	AccountCategory,
	AccountStatus,
	AccountType,
	BankDetailsKey,
	ChartsOfAccountsActionMode,
	ChartsOfAccountsFormTab,
	ChartsOfAccountsTableColumnKey,
	NormalBalance,
} from "@/app/src/types/modules/maintenance/financial-management/charts-of-accounts/ChartsOfAccountsTypes";

export const ChartsOfAccountsHref =
	"/maintenance/charts-of-accounts";

export const AccountTypes: AccountType[] = [
	"Assets",
	"Liabilities",
	"Equity",
	"Revenues",
	"Expenses",
	"Other Income/Expenses",
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

export const ChartsOfAccountsNavs = [
	"All Accounts",
	"Balance Sheet",
	"Income Statement",
	"Cash Flow",
	"Inactive Accounts",
] as const;

export type ChartsOfAccountsNav = (typeof ChartsOfAccountsNavs)[number];

export const ChartsOfAccountsActionCopy: Record<
	ChartsOfAccountsActionMode,
	{
		heading: string;
		helper: string;
	}
> = {
	add: {
		heading: "Add Account",
		helper:
			"Create new ledger accounts from the main Chart of Accounts page.",
	},
	edit: {
		heading: "Edit Account",
		helper:
			"Open an account from the table to update its reporting and bank details.",
	},
	view: {
		heading: "View Account",
		helper:
			"Select an account from the table to review its hierarchy and setup.",
	},
};

export const ChartsOfAccountsDrawerTabs: ChartsOfAccountsFormTab[] = [
	"Account Information",
	"Bank Details",
];

export const ChartsOfAccountsBankFields: Array<{
	label: string;
	key: BankDetailsKey;
	type?: string;
}> = [
	{ label: "Bank Name", key: "bankName" },
	{ label: "Bank Account Number", key: "bankAccountNumber" },
	{ label: "Branch", key: "branch" },
	{ label: "SWIFT/BIC Code", key: "swiftCode" },
	{ label: "Currency", key: "currency" },
	{ label: "Account Type", key: "accountType" },
	{ label: "Opening Balance", key: "openingBalance" },
	{ label: "Opening Balance Date", key: "openingBalanceDate", type: "date" },
	{ label: "Contact Person", key: "contactPerson" },
	{ label: "Contact Number", key: "contactNumber" },
];

export const ChartsOfAccountsTableColumns: Array<{
	label: string;
	key?: ChartsOfAccountsTableColumnKey;
	className?: string;
	sortable?: boolean;
}> = [
	{ label: "Account Number", key: "accountNumber", className: "min-w-36" },
	{ label: "Account Name", key: "accountName", className: "min-w-72" },
	{ label: "Account Type", key: "accountType", className: "min-w-32" },
	{
		label: "Statement Section",
		key: "statementSection",
		className: "min-w-44",
	},
	{ label: "Normal Balance", key: "normalBalance", className: "min-w-36" },
	{ label: "Status", key: "status", className: "min-w-28" },
	{
		label: "Actions",
		className: "module-table-sticky-header sticky right-0 min-w-28 text-right",
	},
];

export const AccountTypeBadgeVariants: Record<
	AccountType,
	"blue" | "green" | "gray" | "amber" | "violet" | "rose"
> = {
	Assets: "blue",
	Liabilities: "amber",
	Equity: "violet",
	Revenues: "green",
	Expenses: "rose",
	"Other Income/Expenses": "gray",
};

export const BadgeVariantClasses = {
	blue: "bg-blue-50 text-blue-700 ring-blue-200",
	green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
	gray: "bg-slate-100 text-slate-600 ring-slate-200",
	amber: "bg-amber-50 text-amber-700 ring-amber-200",
	violet: "bg-violet-50 text-violet-700 ring-violet-200",
	rose: "bg-rose-50 text-rose-700 ring-rose-200",
} as const;
