import type { Row, Table } from "@tanstack/react-table";
import type {
  DefaultAccountExpenseParentOptionsResponseDto,
  DefaultAccountListResponseDto,
  DefaultAccountResponseDto,
  DefaultAccountResponseDtoStatus,
  DefaultAccountResponseDtoType,
  GeneratedDefaultAccountResponseDtoRole,
  SaveDefaultAccountExpenseSubAccountResponseDto,
  SaveDefaultAccountResponseDto,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export type DefaultAccountType = DefaultAccountResponseDtoType;
export type DefaultAccountStatus = "Active" | "Inactive";
export type ApiDefaultAccountStatus = DefaultAccountResponseDtoStatus;

export type GeneratedDefaultAccountRole = GeneratedDefaultAccountResponseDtoRole;

export type GeneratedDefaultAccount = {
  role: GeneratedDefaultAccountRole;
  chartAccountId: string;
  accountCode: string;
  accountTitle: string;
  accountType: string | null;
  accountNature: string | null;
  parentAccountId: string | null;
  status: ApiDefaultAccountStatus;
};

export type DefaultAccount = {
  id: string;
  type: DefaultAccountType;
  defaultAccountName: string;
  description: string;
  status: DefaultAccountStatus;
  expenseParentCoaId?: string;
  generatedAccounts: GeneratedDefaultAccount[];
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type DefaultAccountFormValues = {
  type: DefaultAccountType;
  defaultAccountName: string;
  description: string;
  status: DefaultAccountStatus;
  expenseParentCoaId: string;
};

export type DefaultAccountFormErrors = Partial<Record<keyof DefaultAccountFormValues, string>>;

export type DefaultAccountActionMode = "add" | "edit" | "view";
export type DefaultAccountStatusFilter = "" | DefaultAccountStatus;
export type DefaultAccountTypeFilter = "" | DefaultAccountType;

export type DefaultAccountTableColumnKey =
  | "defaultAccountName"
  | "description"
  | "type"
  | "accountCode"
  | "accountName"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type DefaultAccountColumnMeta = {
  className: string;
};

export type DefaultAccountPermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canCancel: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type DefaultAccountStatistics = {
  totalDefaultAccounts: number;
  activeDefaultAccounts: number;
  inactiveDefaultAccounts: number;
  expenseDefaultAccounts: number;
  collectionDefaultAccounts: number;
};

export type ApiDefaultAccount = DefaultAccountResponseDto;

export type ApiDefaultAccountListResponse = DefaultAccountListResponseDto;

export type ApiDefaultAccountSaveResponse = SaveDefaultAccountResponseDto;

export type DefaultAccountExpenseParentOption = {
  id: string;
  accountCode: string;
  accountTitle: string;
  accountLevel: string;
  parentAccountId: string | null;
};

export type ApiDefaultAccountExpenseParentOptionsResponse = DefaultAccountExpenseParentOptionsResponseDto;

export type ApiDefaultAccountExpenseSubAccountSaveResponse = SaveDefaultAccountExpenseSubAccountResponseDto;

export type DefaultAccountListResponse = {
  defaultAccounts: DefaultAccount[];
  statistics: DefaultAccountStatistics;
  permissions: DefaultAccountPermissions;
};

export type DefaultAccountDrawerState = {
  mode: DefaultAccountActionMode;
  defaultAccount?: DefaultAccount;
} | null;

export type DefaultAccountDrawerProps = {
  defaultAccount?: DefaultAccount;
  isOpen: boolean;
  mode: DefaultAccountActionMode;
  permissions: DefaultAccountPermissions;
  onClose: () => void;
};

export type DefaultAccountTableProps = {
  defaultAccounts: DefaultAccount[];
  filteredDefaultAccounts: DefaultAccount[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: DefaultAccountPermissions;
  query: string;
  statusFilter: DefaultAccountStatusFilter;
  typeFilter: DefaultAccountTypeFilter;
  onEditDefaultAccount: (account: DefaultAccount) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: DefaultAccountStatusFilter) => void;
  onToggleStatus: (account: DefaultAccount) => void;
  onTypeFilterChange: (value: DefaultAccountTypeFilter) => void;
  onViewDefaultAccount: (account: DefaultAccount) => void;
};

export type DefaultAccountStatisticCardsProps = {
  statistics: DefaultAccountStatistics;
  isLoading?: boolean;
};

export type DefaultAccountTableFiltersProps = {
  exportAllRows: DefaultAccount[];
  exportFilteredRows: DefaultAccount[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: DefaultAccountPermissions;
  query: string;
  statusFilter: DefaultAccountStatusFilter;
  table: Table<DefaultAccount>;
  typeFilter: DefaultAccountTypeFilter;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: DefaultAccountStatusFilter) => void;
  onTypeFilterChange: (value: DefaultAccountTypeFilter) => void;
};

export type DefaultAccountTableRowProps = {
  row: Row<DefaultAccount>;
  permissions: DefaultAccountPermissions;
  onEditDefaultAccount: (account: DefaultAccount) => void;
  onToggleStatus: (account: DefaultAccount) => void;
  onViewDefaultAccount: (account: DefaultAccount) => void;
};

export type DefaultAccountImportColumnId = "defaultAccountName" | "description" | "type";

export type DefaultAccountImportColumnHeader = {
  className: string;
  id: DefaultAccountImportColumnId;
  label: string;
  stickyLeft?: number;
};

export type DefaultAccountImportColumnWidths = Record<DefaultAccountImportColumnId, number>;

export type DefaultAccountImportCellErrors = Partial<Record<DefaultAccountImportColumnId, string[]>>;

export type DefaultAccountImportPreviewRow = {
  cellErrors: DefaultAccountImportCellErrors;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  defaultAccount: DefaultAccountFormValues;
};

export type DefaultAccountImportProgress = {
  imported: number;
  total: number;
};

export type DefaultAccountImportMode = "all-rows" | "all-valid" | "selected-valid";

export type DefaultAccountImportDialogProps = {
  existingDefaultAccounts: DefaultAccount[];
  isOpen: boolean;
  onClose: () => void;
  onImportDefaultAccounts: (defaultAccounts: DefaultAccountFormValues[]) => Promise<DefaultAccount[]>;
};
