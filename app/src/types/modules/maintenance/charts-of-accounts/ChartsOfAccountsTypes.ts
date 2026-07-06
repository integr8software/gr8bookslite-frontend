export type AccountLevel = "MAJOR" | "SUB1" | "SUB2" | "SUB3" | "SPECIFIC";

export type AccountType =
  | "ASSET"
  | "LIABILITY"
  | "EQUITY"
  | "REVENUE"
  | "EXPENSE";

export type AccountNature = "DEBIT" | "CREDIT";

export type NormalBalance = AccountNature;

export type AccountStatus = "Active" | "Inactive";

export type StatementGroup = "Balance Sheet" | "Income Statement" | "Cash Flow";

export type BankDetails = {
  bankName: string;
  bankAccountNumber: string;
  branch: string;
  currency: string;
  currencyExchangeRate: string;
  accountType: string;
};

export type BankDetailsKey = keyof BankDetails;

export type ChartAccount = {
  id: string;
  accountNumber: string;
  accountName: string;
  accountLevel: AccountLevel;
  accountGroup: string;
  parentId: string | null;
  accountType: AccountType;
  statementGroup: StatementGroup;
  statementSection: string;
  reportAlias: string;
  normalBalance: NormalBalance;
  description: string;
  status: AccountStatus;
  showInReports: boolean;
  isPostingAccount: boolean;
  isSystemDefault: boolean;
  isUserCreated: boolean;
  isBankLinked: boolean;
  bankDetails?: BankDetails;
  children?: ChartAccount[];
};

export type ChartAccountFormValues = Omit<
  ChartAccount,
  | "accountLevel"
  | "accountGroup"
  | "accountType"
  | "children"
  | "id"
  | "isBankLinked"
  | "isSystemDefault"
  | "isUserCreated"
  | "normalBalance"
  | "status"
> & {
  accountLevel: AccountLevel | "";
  accountType: AccountType | "";
  normalBalance: NormalBalance | "";
  status: AccountStatus | "";
  isBankLinked: boolean;
  bankDetails: BankDetails;
};

export type FlattenedChartAccount = {
  account: ChartAccount;
  level: number;
  parentAccountNumber: string;
  parentPath: string;
};

export type FilterValue<TValue> = TValue | "All";

export type ChartAccountStructureFilter =
  | "All"
  | "With Submodules"
  | "Without Submodules";

export type ChartsOfAccountsActionMode = "add" | "edit" | "view";

export type ChartsOfAccountsFormTab = "Account Information" | "Bank Details";

export type ChartsOfAccountsFormProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  accountCodeError?: string;
  accountNameError?: string;
  availableAccountLevels: AccountLevel[];
  isAccountCodeLoading?: boolean;
  isReadOnly?: boolean;
  parentAccountError?: string;
  submitted: boolean;
  values: ChartAccountFormValues;
  onFieldChange: <Key extends keyof ChartAccountFormValues>(
    key: Key,
    value: ChartAccountFormValues[Key],
  ) => void;
  onParentChange: (parentId: string | null) => void;
};

export type ChartsOfAccountsTableColumnKey =
  | "accountNumber"
  | "accountName"
  | "accountLevel"
  | "accountType"
  | "parentPath"
  | "statementGroup"
  | "statementSection"
  | "reportAlias"
  | "normalBalance"
  | "status";

export type SortDirection = "asc" | "desc";
