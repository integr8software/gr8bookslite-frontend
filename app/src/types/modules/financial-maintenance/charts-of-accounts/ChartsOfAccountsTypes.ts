import type { ReactNode } from "react";
import type { Table } from "@tanstack/react-table";

export type AccountLevel = "MAJOR" | "SUB1" | "SUB2" | "SUB3" | "SPECIFIC";

export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";

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
  accountGroup: string | string[];
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
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string;
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
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt"
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

export type ChartAccountStructureFilter = "All" | "With Submodules" | "Without Submodules";

export type ChartsOfAccountsNav = "All Accounts" | "Balance Sheet" | "Income Statement" | "Cash Flow";

export type ChartsOfAccountsDrawerMode = "add" | "edit" | "view";

export type ChartsOfAccountsDropPlacement = "before" | "inside" | "after";

export type ActiveDropTarget = {
  id: string;
  placement: ChartsOfAccountsDropPlacement;
};

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
  onFieldChange: <Key extends keyof ChartAccountFormValues>(key: Key, value: ChartAccountFormValues[Key]) => void;
  onParentChange: (parentId: string | null) => void;
};

export type ChartsOfAccountsAccountFieldsProps = ChartsOfAccountsFormProps;

export type ChartsOfAccountsBankFieldsProps = {
  readOnly?: boolean;
  submitted: boolean;
  values: ChartAccountFormValues;
  onBankFieldChange: (key: BankDetailsKey, value: string) => void;
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
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type SortDirection = "asc" | "desc";

export type ChartsOfAccountsPermissions = {
  canCreate: boolean;
  canExport?: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type ChartsOfAccountsDrawerProps = {
  account: ChartAccount | null;
  accounts: ChartAccount[];
  isOpen: boolean;
  isSaving?: boolean;
  mode?: ChartsOfAccountsDrawerMode;
  parentAccount?: ChartAccount | null;
  saveResetToken?: number;
  onClose: () => void;
  onSave: (values: ChartAccountFormValues) => void;
};

export type ChartsOfAccountsFiltersProps = {
  accountTypeFilter: FilterValue<AccountType>;
  activeTab: ChartsOfAccountsNav;
  searchQuery: string;
  statusFilter: FilterValue<AccountStatus>;
  structureFilter: ChartAccountStructureFilter;
  exportAllRows: FlattenedChartAccount[];
  exportFilteredRows: FlattenedChartAccount[];
  isRefreshing: boolean;
  permissions: Pick<ChartsOfAccountsPermissions, "canExport">;
  table: Table<FlattenedChartAccount>;
  onAccountTypeChange: (value: FilterValue<AccountType>) => void;
  onRefresh: () => void;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  onStatusChange: (value: FilterValue<AccountStatus>) => void;
  onStructureChange: (value: ChartAccountStructureFilter) => void;
  onTabChange: (value: ChartsOfAccountsNav) => void;
};

export type ChartsOfAccountsTableProps = {
  accounts: ChartAccount[];
  expandedIds: Set<string>;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  table: Table<FlattenedChartAccount>;
  toolbar?: ReactNode;
  canDragRows: boolean;
  showHierarchyGuides: boolean;
  showParentColumn: boolean;
  permissions: Omit<ChartsOfAccountsPermissions, "canExport">;
  onEdit: (account: ChartAccount) => void;
  onAddChild: (account: ChartAccount) => void;
  onStatusChange: (account: ChartAccount) => void;
  onReorderAccount: (accountId: string, overAccountId: string, placement: ChartsOfAccountsDropPlacement) => void;
  onToggleExpanded: (accountId: string) => void;
  onView: (account: ChartAccount) => void;
};

export type ChartsOfAccountsStatisticCardsProps = {
  flatAccounts: FlattenedChartAccount[];
  isLoading?: boolean;
};

export type ChartsOfAccountsTableRowProps = {
  account: ChartAccount;
  activeDragAccount?: ActiveDragAccount;
  activeDropPlacement?: ChartsOfAccountsDropPlacement | null;
  canDragRows: boolean;
  expandedIds: Set<string>;
  level: number;
  parentPath: string;
  parentAccount: ChartAccount | null;
  permissions: Omit<ChartsOfAccountsPermissions, "canExport">;
  showHierarchyGuides: boolean;
  showParentColumn: boolean;
  visibleColumnIds: string[];
  onAddChild: (account: ChartAccount) => void;
  onEdit: (account: ChartAccount) => void;
  onStatusChange: (account: ChartAccount) => void;
  onToggleExpanded: (accountId: string) => void;
  onView: (account: ChartAccount) => void;
};

export type ActiveDragAccount = {
  id: string;
  isSpecific: boolean;
  parentId: string | null;
};
