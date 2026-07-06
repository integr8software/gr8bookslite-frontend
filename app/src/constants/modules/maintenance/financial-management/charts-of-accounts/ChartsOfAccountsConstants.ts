import type {
  AccountLevel,
  AccountStatus,
  AccountType,
  BankDetailsKey,
  ChartsOfAccountsFormTab,
  ChartsOfAccountsNav,
  ChartsOfAccountsTableColumnKey,
  FlattenedChartAccount,
  NormalBalance,
} from "@/app/src/types/modules/maintenance/charts-of-accounts/ChartsOfAccountsTypes";
import { FinancialManagementCashInBankAccountTitle } from "@/app/src/constants/modules/maintenance/financial-management/FinancialManagementAccountTitleConstants";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableToolbar";

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
  MAJOR: "Major Account",
  SUB1: "Sub Account 1",
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
] as const satisfies ChartsOfAccountsNav[];

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
  { label: "Currency", key: "currency" },
  { label: "Currency Exchange Rate", key: "currencyExchangeRate", type: "number" },
  { label: "Account Type", key: "accountType" },
];

export const ChartsOfAccountsTableColumns: Array<{
  label: string;
  key?: ChartsOfAccountsTableColumnKey;
  className?: string;
  sortable?: boolean;
}> = [
  { label: "Account Code", key: "accountNumber", className: "min-w-36" },
  { label: "Account Name", key: "accountName", className: "min-w-72" },
  { label: "Parent", key: "parentPath", className: "min-w-72" },
  { label: "Account Type", key: "accountType", className: "min-w-32 text-center" },
  { label: "Account Level", key: "accountLevel", className: "min-w-36 text-center" },
  {
    label: "Statement Section",
    key: "statementSection",
    className: "min-w-44 text-center",
  },
  { label: "Account Nature", key: "normalBalance", className: "min-w-36 text-center" },
  {
    label: "Report Alias",
    key: "reportAlias",
    className: "min-w-44 text-center",
  },
  { label: "Status", key: "status", className: "min-w-28 text-center" },
  {
    label: "Actions",
    className: "min-w-36 text-center",
  },
];

export const ChartsOfAccountsExportColumns: ModuleTableExportColumn<FlattenedChartAccount>[] =
  [
    {
      header: "Account Code",
      id: "accountNumber",
      value: (row) => row.account.accountNumber,
    },
    {
      header: "Parent Account Code",
      id: "parentAccountNumber",
      value: (row) => row.parentAccountNumber,
    },
    { header: "Parent", id: "parent", value: (row) => row.parentPath },
    {
      header: "Account Name",
      id: "accountName",
      value: (row) => row.account.accountName,
    },
    {
      header: "Account Level",
      id: "accountLevel",
      value: (row) => AccountLevelLabels[row.account.accountLevel],
    },
    {
      header: "Account Type",
      id: "accountType",
      value: (row) => AccountTypeLabels[row.account.accountType],
    },
    {
      header: "Statement Section",
      id: "statementSection",
      value: (row) => row.account.statementSection,
    },
    {
      header: "Account Nature",
      id: "normalBalance",
      value: (row) => NormalBalanceLabels[row.account.normalBalance],
    },
    {
      header: "Description",
      id: "description",
      value: (row) => row.account.description,
    },
    { header: "Status", id: "status", value: (row) => row.account.status },
    {
      header: "Posting Account",
      id: "isPostingAccount",
      value: (row) => (row.account.isPostingAccount ? "Yes" : "No"),
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
