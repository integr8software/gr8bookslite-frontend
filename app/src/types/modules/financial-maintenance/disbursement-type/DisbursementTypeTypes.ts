import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type {
  DisbursementTypeResponseDtoStatus,
  DisbursementTypeResponseDtoType,
  GeneratedDisbursementTypeResponseDtoRole,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export type DisbursementTypeType = DisbursementTypeResponseDtoType;
export type DisbursementTypeStatus = "Active" | "Inactive";
export type DisbursementTypeMaintenanceKind = "disbursement" | "collection";
export type DisbursementTypeAccountSetupMode = "Existing" | "Auto";

export type GeneratedDisbursementTypeRole = GeneratedDisbursementTypeResponseDtoRole;

export type GeneratedDisbursementType = {
  role: GeneratedDisbursementTypeRole;
  chartAccountId: string;
  accountCode: string;
  accountTitle: string;
  accountType: string | null;
  accountNature: string | null;
  parentAccountId: string | null;
  status: DisbursementTypeResponseDtoStatus;
};

export type DisbursementType = {
  id: string;
  type: DisbursementTypeType;
  disbursementTypeName: string;
  description: string;
  status: DisbursementTypeStatus;
  accountSetupMode?: DisbursementTypeAccountSetupMode;
  expenseCoaId?: string;
  expenseParentCoaId?: string;
  generatedAccounts: GeneratedDisbursementType[];
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type DisbursementTypeFormValues = {
  type: DisbursementTypeType;
  disbursementTypeName: string;
  description: string;
  status: DisbursementTypeStatus;
  accountSetupMode: DisbursementTypeAccountSetupMode;
  expenseCoaId: string;
  expenseParentCoaId: string;
};

export type DisbursementTypeFormErrors = Partial<Record<keyof DisbursementTypeFormValues, string>>;

export type DisbursementTypeActionMode = "add" | "edit" | "view";

export type DisbursementTypeFieldsProps = {
  canAddExpenseTypeSubAccount?: boolean;
  canCancelStatus?: boolean;
  errors: DisbursementTypeFormErrors;
  accountOptions?: ModuleChartAccount[];
  expenseParentOptions?: AppAdvancedDropdownOption[];
  generatedAccounts?: GeneratedDisbursementType[];
  hideTypeField?: boolean;
  isLoadingExpenseParentOptions?: boolean;
  isReadonly: boolean;
  nameLabel?: string;
  mode: DisbursementTypeActionMode;
  nextExpenseSubAccountLevel?: string | null;
  onAccountSetupModeChange?: (value: DisbursementTypeAccountSetupMode) => void;
  onExpenseParentChange?: (value: string | string[]) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  onOpenExpenseSubAccountDialog?: () => void;
  onExpenseAccountChange?: (value: string) => void;
  onStatusChange: (value: DisbursementTypeStatus) => void;
  values: DisbursementTypeFormValues;
};

export type DisbursementTypeFormPageOptions = {
  existingDisbursementType?: DisbursementType;
  isOpen?: boolean;
  kind?: DisbursementTypeMaintenanceKind;
  mode: DisbursementTypeActionMode;
  onSaved: () => void;
};

export type DisbursementTypeStoreOptions = {
  kind?: DisbursementTypeMaintenanceKind;
  refetchOnMount?: boolean | "always";
};

export type DisbursementTypeStatusFilter = "" | DisbursementTypeStatus;
export type DisbursementTypeTypeFilter = "" | DisbursementTypeType;

export type DisbursementTypeTableColumnKey =
  | "disbursementTypeName"
  | "description"
  | "type"
  | "accountCode"
  | "accountName"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type DisbursementTypeColumnMeta = {
  className: string;
};

export type DisbursementTypePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canCancel: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type DisbursementTypeStatistics = {
  totalDisbursementTypes: number;
  activeDisbursementTypes: number;
  inactiveDisbursementTypes: number;
  expenseDisbursementTypes: number;
  collectionDisbursementTypes: number;
};

export type DisbursementTypeExpenseParentOption = {
  id: string;
  accountCode: string;
  accountTitle: string;
  accountLevel: string;
  parentAccountId: string | null;
};

export type DisbursementTypeListResult = {
  disbursementTypes: DisbursementType[];
  statistics: DisbursementTypeStatistics;
  permissions: DisbursementTypePermissions;
};

export type DisbursementTypeDrawerState = {
  mode: DisbursementTypeActionMode;
  disbursementType?: DisbursementType;
} | null;

export type DisbursementTypeDrawerProps = {
  disbursementType?: DisbursementType;
  isOpen: boolean;
  kind?: DisbursementTypeMaintenanceKind;
  mode: DisbursementTypeActionMode;
  permissions: DisbursementTypePermissions;
  onClose: () => void;
};

export type DisbursementTypeTableProps = {
  disbursementTypes: DisbursementType[];
  filteredDisbursementTypes: DisbursementType[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: DisbursementTypePermissions;
  query: string;
  statusFilter: DisbursementTypeStatusFilter;
  typeFilter: DisbursementTypeTypeFilter;
  showTypeTabs?: boolean;
  title?: string;
  exportFileName?: string;
  onEditDisbursementType: (account: DisbursementType) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: DisbursementTypeStatusFilter) => void;
  onToggleStatus: (account: DisbursementType) => void;
  onTypeFilterChange: (value: DisbursementTypeTypeFilter) => void;
  onViewDisbursementType: (account: DisbursementType) => void;
};

export type DisbursementTypeStatisticCardsProps = {
  statistics: DisbursementTypeStatistics;
  isLoading?: boolean;
};

export type DisbursementTypeTableFiltersProps = {
  exportAllRows: DisbursementType[];
  exportFilteredRows: DisbursementType[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: DisbursementTypePermissions;
  query: string;
  statusFilter: DisbursementTypeStatusFilter;
  table: Table<DisbursementType>;
  typeFilter: DisbursementTypeTypeFilter;
  showTypeTabs?: boolean;
  title?: string;
  exportFileName?: string;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: DisbursementTypeStatusFilter) => void;
  onTypeFilterChange: (value: DisbursementTypeTypeFilter) => void;
};

export type DisbursementTypeTableRowProps = {
  row: Row<DisbursementType>;
  permissions: DisbursementTypePermissions;
  onEditDisbursementType: (account: DisbursementType) => void;
  onToggleStatus: (account: DisbursementType) => void;
  onViewDisbursementType: (account: DisbursementType) => void;
};

export type DisbursementTypeImportColumnId = "disbursementTypeName" | "description";

export type DisbursementTypeImportColumnHeader = {
  className: string;
  id: DisbursementTypeImportColumnId;
  label: string;
  stickyLeft?: number;
};

export type DisbursementTypeImportColumnWidths = Record<DisbursementTypeImportColumnId, number>;

export type DisbursementTypeImportCellErrors = Partial<Record<DisbursementTypeImportColumnId, string[]>>;

export type DisbursementTypeImportPreviewRow = {
  cellErrors: DisbursementTypeImportCellErrors;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  disbursementType: DisbursementTypeFormValues;
};

export type DisbursementTypeImportProgress = {
  imported: number;
  total: number;
};

export type DisbursementTypeImportMode = "all-rows" | "all-valid" | "selected-valid";

export type DisbursementTypeImportDialogProps = {
  description?: string;
  existingDisbursementTypes: DisbursementType[];
  importLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onImportDisbursementTypes: (disbursementTypes: DisbursementTypeFormValues[]) => Promise<DisbursementType[]>;
  title?: string;
};
