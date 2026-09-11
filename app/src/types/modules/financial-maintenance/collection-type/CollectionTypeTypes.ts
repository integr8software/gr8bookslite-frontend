import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";
import type { AppAdvancedDropdownOption } from "@/app/src/types/shared/advanced-dropdown/AppAdvancedDropdownTypes";
import type {
  CollectionTypeResponseDtoStatus,
  CollectionTypeResponseDtoType,
  GeneratedCollectionTypeResponseDtoRole,
} from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";

export type CollectionTypeType = CollectionTypeResponseDtoType;
export type CollectionTypeStatus = "Active" | "Inactive";
export type CollectionTypeMaintenanceKind = "disbursement" | "collection";
export type CollectionTypeAccountSetupMode = "Existing" | "Auto";

export type GeneratedCollectionTypeRole = GeneratedCollectionTypeResponseDtoRole;

export type GeneratedCollectionType = {
  role: GeneratedCollectionTypeRole;
  chartAccountId: string;
  accountCode: string;
  accountTitle: string;
  accountType: string | null;
  accountNature: string | null;
  parentAccountId: string | null;
  status: CollectionTypeResponseDtoStatus;
};

export type CollectionType = {
  id: string;
  type: CollectionTypeType;
  collectionTypeName: string;
  description: string;
  status: CollectionTypeStatus;
  accountSetupMode?: CollectionTypeAccountSetupMode;
  revenueCoaId?: string;
  expenseParentCoaId?: string;
  generatedAccounts: GeneratedCollectionType[];
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type CollectionTypeFormValues = {
  type: CollectionTypeType;
  collectionTypeName: string;
  description: string;
  status: CollectionTypeStatus;
  accountSetupMode: CollectionTypeAccountSetupMode;
  revenueCoaId: string;
  expenseParentCoaId: string;
};

export type CollectionTypeFormErrors = Partial<Record<keyof CollectionTypeFormValues, string>>;

export type CollectionTypeActionMode = "add" | "edit" | "view";

export type CollectionTypeFieldsProps = {
  canAddExpenseTypeSubAccount?: boolean;
  canCancelStatus?: boolean;
  errors: CollectionTypeFormErrors;
  accountOptions?: ModuleChartAccount[];
  expenseParentOptions?: AppAdvancedDropdownOption[];
  generatedAccounts?: GeneratedCollectionType[];
  hideTypeField?: boolean;
  isLoadingExpenseParentOptions?: boolean;
  isReadonly: boolean;
  nameLabel?: string;
  mode: CollectionTypeActionMode;
  nextExpenseSubAccountLevel?: string | null;
  onAccountSetupModeChange?: (value: CollectionTypeAccountSetupMode) => void;
  onRevenueAccountChange?: (value: string) => void;
  onExpenseParentChange?: (value: string | string[]) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  onOpenExpenseSubAccountDialog?: () => void;
  onStatusChange: (value: CollectionTypeStatus) => void;
  values: CollectionTypeFormValues;
};

export type CollectionTypeFormPageOptions = {
  existingCollectionType?: CollectionType;
  isOpen?: boolean;
  kind?: CollectionTypeMaintenanceKind;
  mode: CollectionTypeActionMode;
  onSaved: () => void;
};

export type CollectionTypeStoreOptions = {
  kind?: CollectionTypeMaintenanceKind;
  refetchOnMount?: boolean | "always";
};

export type CollectionTypeStatusFilter = "" | CollectionTypeStatus;
export type CollectionTypeTypeFilter = "" | CollectionTypeType;

export type CollectionTypeTableColumnKey =
  "collectionTypeName" | "description" | "accountCode" | "accountName" | "status" | "createdBy" | "createdAt" | "updatedBy" | "updatedAt";

export type CollectionTypeColumnMeta = {
  className: string;
};

export type CollectionTypePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canCancel: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type CollectionTypeStatistics = {
  totalCollectionTypes: number;
  activeCollectionTypes: number;
  inactiveCollectionTypes: number;
  expenseCollectionTypes: number;
  collectionCollectionTypes: number;
};

export type CollectionTypeExpenseParentOption = {
  id: string;
  accountCode: string;
  accountTitle: string;
  accountLevel: string;
  parentAccountId: string | null;
};

export type CollectionTypeListResult = {
  collectionTypes: CollectionType[];
  statistics: CollectionTypeStatistics;
  permissions: CollectionTypePermissions;
};

export type CollectionTypeDrawerState = {
  mode: CollectionTypeActionMode;
  collectionType?: CollectionType;
} | null;

export type CollectionTypeDrawerProps = {
  collectionType?: CollectionType;
  isOpen: boolean;
  kind?: CollectionTypeMaintenanceKind;
  mode: CollectionTypeActionMode;
  permissions: CollectionTypePermissions;
  onClose: () => void;
};

export type CollectionTypeTableProps = {
  collectionTypes: CollectionType[];
  filteredCollectionTypes: CollectionType[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: CollectionTypePermissions;
  query: string;
  statusFilter: CollectionTypeStatusFilter;
  typeFilter: CollectionTypeTypeFilter;
  showTypeTabs?: boolean;
  title?: string;
  exportFileName?: string;
  onEditCollectionType: (account: CollectionType) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: CollectionTypeStatusFilter) => void;
  onToggleStatus: (account: CollectionType) => void;
  onTypeFilterChange: (value: CollectionTypeTypeFilter) => void;
  onViewCollectionType: (account: CollectionType) => void;
};

export type CollectionTypeStatisticCardsProps = {
  statistics: CollectionTypeStatistics;
  isLoading?: boolean;
};

export type CollectionTypeTableFiltersProps = {
  exportAllRows: CollectionType[];
  exportFilteredRows: CollectionType[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: CollectionTypePermissions;
  query: string;
  statusFilter: CollectionTypeStatusFilter;
  table: Table<CollectionType>;
  typeFilter: CollectionTypeTypeFilter;
  showTypeTabs?: boolean;
  title?: string;
  exportFileName?: string;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: CollectionTypeStatusFilter) => void;
  onTypeFilterChange: (value: CollectionTypeTypeFilter) => void;
};

export type CollectionTypeTableRowProps = {
  row: Row<CollectionType>;
  permissions: CollectionTypePermissions;
  onEditCollectionType: (account: CollectionType) => void;
  onToggleStatus: (account: CollectionType) => void;
  onViewCollectionType: (account: CollectionType) => void;
};

export type CollectionTypeImportColumnId = "collectionTypeName" | "description" | "type";

export type CollectionTypeImportColumnHeader = {
  className: string;
  id: CollectionTypeImportColumnId;
  label: string;
  stickyLeft?: number;
};

export type CollectionTypeImportColumnWidths = Record<CollectionTypeImportColumnId, number>;

export type CollectionTypeImportCellErrors = Partial<Record<CollectionTypeImportColumnId, string[]>>;

export type CollectionTypeImportPreviewRow = {
  cellErrors: CollectionTypeImportCellErrors;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  collectionType: CollectionTypeFormValues;
};

export type CollectionTypeImportProgress = {
  imported: number;
  total: number;
};

export type CollectionTypeImportMode = "all-rows" | "all-valid" | "selected-valid";

export type CollectionTypeImportDialogProps = {
  description?: string;
  existingCollectionTypes: CollectionType[];
  importLabel?: string;
  isOpen: boolean;
  onClose: () => void;
  onImportCollectionTypes: (collectionTypes: CollectionTypeFormValues[]) => Promise<CollectionType[]>;
  title?: string;
};
