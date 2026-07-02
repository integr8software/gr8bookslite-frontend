import type {
  AccountLevel,
  AccountStatus,
  AccountType,
  BankDetailsKey,
  ChartsOfAccountsActionMode,
  ChartsOfAccountsFormTab,
  ChartsOfAccountsTableColumnKey,
  NormalBalance,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { FinancialManagementCashInBankAccountTitle } from "@/app/src/constants/modules/maintenance/financial-management/FinancialManagementAccountTitleConstants";

export const ChartsOfAccountsHref = "/maintenance/charts-of-accounts";
export const ChartsOfAccountsAccountNamePlaceholder = `${FinancialManagementCashInBankAccountTitle} - Bank Name`;

export const AccountLevels: AccountLevel[] = [
  "MAJOR",
  "SUB1",
  "SUB2",
  "SUB3",
  "SPECIFIC",
];

export const AccountLevelLabels: Record<AccountLevel, string> = {
  MAJOR: "Parent Account",
  SUB1: "Sub Account",
  SUB2: "Sub Account 2",
  SUB3: "Sub Account 3",
  SPECIFIC: "Specific Account",
};

export const AccountTypes: AccountType[] = [
  "ASSET",
  "LIABILITY",
  "EQUITY",
  "REVENUE",
  "EXPENSE",
];

export const AccountTypeLabels: Record<AccountType, string> = {
  ASSET: "Asset",
  LIABILITY: "Liabilities",
  EQUITY: "Equity",
  REVENUE: "Revenue",
  EXPENSE: "Expenses",
};

export const AccountStatuses: AccountStatus[] = ["Active", "Inactive"];

export const NormalBalances: NormalBalance[] = ["DEBIT", "CREDIT"];

export const NormalBalanceLabels: Record<NormalBalance, string> = {
  DEBIT: "Debit",
  CREDIT: "Credit",
};

export const StatementSections = ["Balance Sheet", "Income Statement"];

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
    helper: "Create new ledger accounts from the main Chart of Accounts page.",
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
  { label: "Parent", key: "parentPath", className: "min-w-72" },
  { label: "Account Type", key: "accountType", className: "min-w-32 text-center" },
  {
    label: "Statement Section",
    key: "statementSection",
    className: "min-w-44 text-center",
  },
  { label: "Account Nature", key: "normalBalance", className: "min-w-36 text-center" },
  { label: "Status", key: "status", className: "min-w-28 text-center" },
  {
    label: "Actions",
    className: "min-w-36 text-center",
  },
];

export const AccountTypeBadgeVariants: Record<
  AccountType,
  "blue" | "green" | "gray" | "amber" | "violet" | "rose"
> = {
  ASSET: "blue",
  LIABILITY: "amber",
  EQUITY: "violet",
  REVENUE: "green",
  EXPENSE: "rose",
};

export const BadgeVariantClasses = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  gray: "bg-slate-100 text-slate-600 ring-slate-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
} as const;
