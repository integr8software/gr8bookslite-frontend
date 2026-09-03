import type { ChangeEventHandler, ReactNode } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type BankMasterfileStatus = "Active" | "Inactive";

export type BankMasterfile = {
  id: string;
  accountCode: string;
  accountTitle: string;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  currencyCode: string;
  isDefault: boolean;
  seriesStart: string;
  seriesEnd: string;
  seriesDigits: string;
  status: BankMasterfileStatus;
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type BankMasterfileFormValues = {
  bankName: string;
  branch: string;
  accountNumber: string;
  accountType: string;
  currencyCode: string;
  isDefault: boolean;
  seriesStart: string;
  seriesEnd: string;
  seriesDigits: string;
  status: BankMasterfileStatus;
};

export type BankMasterfileFormErrors = Partial<Record<keyof BankMasterfileFormValues, string>>;

export type BankMasterfileActionMode = "add" | "edit" | "view";

export type BankMasterfileFormPageOptions = {
  existingBank?: BankMasterfile;
  isOpen?: boolean;
  mode?: BankMasterfileActionMode;
  onSaved?: () => void;
};

export type BankMasterfileStoreOptions = {
  refetchOnMount?: boolean | "always";
};

export type BankMasterfileTableColumnKey =
  | "bankName"
  | "branch"
  | "accountNumber"
  | "accountTitle"
  | "accountCode"
  | "currencyCode"
  | "isDefault"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type BankImportColumnId = keyof BankMasterfileFormValues;

export type BankImportCellErrors = Partial<Record<BankImportColumnId, string[]>>;

export type BankImportPreviewRow = {
  cellErrors: BankImportCellErrors;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  values: BankMasterfileFormValues;
};

export type BankImportProgress = {
  imported: number;
  total: number;
};

export type BankImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = BankImportProgress;
export type ImportMode = BankImportMode;

export type BankMasterfilePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type BankMasterfileStatistics = {
  totalBanks: number;
  activeBanks: number;
  inactiveBanks: number;
  defaultBanks: number;
};

export type BankMasterfileListResult = {
  banks: BankMasterfile[];
  statistics: BankMasterfileStatistics;
  permissions: BankMasterfilePermissions;
};

export type BankMasterfileStatusFilter = "" | BankMasterfileStatus;

export type BankMasterfileDrawerState = { mode: BankMasterfileActionMode; bank?: BankMasterfile } | null;

export type BankMasterfileDrawerProps = {
  bank?: BankMasterfile;
  isOpen: boolean;
  mode: BankMasterfileActionMode;
  onClose: () => void;
};

export type BankMasterfileFieldsProps = {
  accountCode: string;
  currencyOptions: Array<{
    code: string;
    country: string;
    name: string;
  }>;
  errors: BankMasterfileFormErrors;
  isAccountCodeLoading: boolean;
  isReadonly: boolean;
  mode: BankMasterfileActionMode;
  values: BankMasterfileFormValues;
  onCurrencyChange: (value: string) => void;
  onDefaultChange: (value: boolean) => void;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
  onStatusChange: (value: BankMasterfileFormValues["status"]) => void;
};

import type { ModuleFormFieldProps } from "@/app/src/ui/shared/field-management/ModuleFormField";

export type BankMasterfileFormFieldProps = ModuleFormFieldProps;

export type BankMasterfileTableProps = {
  banks: BankMasterfile[];
  filteredBanks: BankMasterfile[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: BankMasterfilePermissions;
  query: string;
  statusFilter: BankMasterfileStatusFilter;
  onEditBank: (bank: BankMasterfile) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: BankMasterfileStatusFilter) => void;
  onToggleStatus: (bank: BankMasterfile) => void;
  onViewBank: (bank: BankMasterfile) => void;
};

export type BankMasterfileStatisticCardsProps = {
  banks: BankMasterfile[];
  isLoading?: boolean;
};

export type BankMasterfileTableFiltersProps = {
  exportAllRows: BankMasterfile[];
  exportFilteredRows: BankMasterfile[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: BankMasterfilePermissions;
  query: string;
  statusFilter: BankMasterfileStatusFilter;
  table: Table<BankMasterfile>;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: BankMasterfileStatusFilter) => void;
};

export type BankMasterfileTableRowProps = {
  row: Row<BankMasterfile>;
  permissions: BankMasterfilePermissions;
  onEditBank: (bank: BankMasterfile) => void;
  onToggleStatus: (bank: BankMasterfile) => void;
  onViewBank: (bank: BankMasterfile) => void;
};

export type BankMasterfileCellContentProps = {
  bank: BankMasterfile;
  columnId: string;
  permissions: BankMasterfilePermissions;
  onEditBank: (bank: BankMasterfile) => void;
  onToggleStatus: (bank: BankMasterfile) => void;
  onViewBank: (bank: BankMasterfile) => void;
};

export type BankMasterfileImportDialogProps = {
  existingBanks: BankMasterfile[];
  isOpen: boolean;
  onClose: () => void;
  onImportBanks: (banks: BankMasterfileFormValues[]) => Promise<BankMasterfile[]>;
};

export type BankImportRowProps = {
  row: BankImportPreviewRow;
  selected: boolean;
  disabled: boolean;
  onToggle: (rowId: string, selected: boolean) => void;
  onUpdate: (rowId: string, field: BankImportColumnId, value: string | boolean) => void;
  onPasteCell: (rowId: string, field: BankImportColumnId, text: string) => void;
  onMoveRow: (sourceRowId: string, targetRowId: string, position: "before" | "after") => void;
};
