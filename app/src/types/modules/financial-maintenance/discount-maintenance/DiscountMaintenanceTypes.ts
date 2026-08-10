import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type DiscountType = "Percentage" | "Fixed";
export type DiscountTransactionType = "Purchase" | "Sales";
export type DiscountStatus = "Active" | "Inactive";
export type DiscountTypeFilter = "All" | DiscountTransactionType;
export type DiscountValueTypeFilter = "All" | DiscountType;
export type DiscountStatusFilter = "" | DiscountStatus;

export type Discount = {
  id: string;
  name: string;
  description: string;
  type: DiscountTransactionType;
  discountType: DiscountType;
  amount: number;
  status: DiscountStatus;
  accountId?: string;
  accountCode?: string;
  accountTitle?: string;
  accountGroupPath?: string;
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type DiscountMaintenanceFormValues = {
  name: string;
  description: string;
  type: DiscountTransactionType;
  discountType: DiscountType;
  amount: string;
  status: DiscountStatus;
};

export type DiscountMaintenanceFormErrors = Partial<Record<keyof DiscountMaintenanceFormValues, string>>;

export type DiscountMaintenanceActionMode = "add" | "edit" | "view";

export type DiscountMaintenanceDrawerState = {
  discount?: Discount;
  initialValues?: DiscountMaintenanceFormValues;
  mode: DiscountMaintenanceActionMode;
} | null;

export type DiscountMaintenanceDrawerProps = {
  discount?: Discount;
  isOpen: boolean;
  mode: DiscountMaintenanceActionMode;
  onClose: () => void;
};

export type DiscountMaintenanceTableColumnKey =
  | "name"
  | "description"
  | "type"
  | "discountType"
  | "amount"
  | "accountCode"
  | "accountTitle"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type DiscountMaintenanceTableRecord = Discount & {
  amountLabel: string;
  valueLabel: string;
};

export type DiscountMaintenanceStatistics = {
  totalDiscounts: number;
  activeDiscounts: number;
  inactiveDiscounts: number;
  purchaseDiscounts: number;
  salesDiscounts: number;
  percentageDiscounts: number;
};

export type DiscountMaintenancePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type DiscountMaintenanceListResult = {
  discounts: Discount[];
  statistics: DiscountMaintenanceStatistics;
  permissions: DiscountMaintenancePermissions;
};

export type DiscountMaintenanceTableProps = {
  discountTypeFilter: DiscountValueTypeFilter;
  filteredDiscounts: Discount[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: DiscountMaintenancePermissions;
  query: string;
  statusFilter: DiscountStatusFilter;
  tableTypeFilter: DiscountTypeFilter;
  discounts: Discount[];
  onDiscountTypeFilterChange: (value: DiscountValueTypeFilter) => void;
  onEditDiscount: (discount: DiscountMaintenanceTableRecord) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: DiscountStatusFilter) => void;
  onToggleStatus: (discount: DiscountMaintenanceTableRecord) => void;
  onTypeFilterChange: (value: DiscountTypeFilter) => void;
  onViewDiscount: (discount: DiscountMaintenanceTableRecord) => void;
};

export type DiscountMaintenanceStatisticCardsProps = {
  statistics: DiscountMaintenanceStatistics;
  isLoading?: boolean;
};

export type DiscountMaintenanceFieldsProps = {
  errors: DiscountMaintenanceFormErrors;
  generatedAccount: {
    accountCode: string;
    accountGroupPath: string;
    accountTitle: string;
  };
  isReadonly: boolean;
  values: DiscountMaintenanceFormValues;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  onStatusChange: (value: DiscountMaintenanceFormValues["status"]) => void;
};

export type DiscountMaintenanceTableRowProps = {
  discount: DiscountMaintenanceTableRecord;
  permissions: DiscountMaintenancePermissions;
  row?: Row<DiscountMaintenanceTableRecord>;
  onEditDiscount: (discount: DiscountMaintenanceTableRecord) => void;
  onToggleStatus: (discount: DiscountMaintenanceTableRecord) => void;
  onViewDiscount: (discount: DiscountMaintenanceTableRecord) => void;
};

export type DiscountMaintenanceTableFiltersProps = {
  discountTypeFilter: DiscountValueTypeFilter;
  exportAllRows: DiscountMaintenanceTableRecord[];
  exportFilteredRows: DiscountMaintenanceTableRecord[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: DiscountMaintenancePermissions;
  query: string;
  statusFilter: DiscountStatusFilter;
  table: Table<DiscountMaintenanceTableRecord>;
  typeFilter: DiscountTypeFilter;
  onDiscountTypeFilterChange: (value: DiscountValueTypeFilter) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: DiscountStatusFilter) => void;
  onTypeFilterChange: (value: DiscountTypeFilter) => void;
};

export type DiscountImportColumnId = "name" | "type" | "description" | "discountType" | "amount";

export type DiscountImportColumnHeader = {
  className: string;
  id: DiscountImportColumnId;
  label: string;
  stickyLeft?: number;
};

export type DiscountImportColumnWidths = Record<DiscountImportColumnId, number>;

export type DiscountImportCellErrors = Partial<Record<DiscountImportColumnId, string[]>>;

export type DiscountImportCellWarnings = Partial<Record<DiscountImportColumnId, string[]>>;

export type DiscountImportPreviewRow = {
  cellErrors: DiscountImportCellErrors;
  cellWarnings: DiscountImportCellWarnings;
  discount: Discount;
  id: string;
  rowErrors: string[];
  rowNumber: number;
};

export type DiscountImportProgress = {
  imported: number;
  total: number;
};

export type DiscountImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = DiscountImportProgress;

export type DiscountMaintenanceImportDialogProps = {
  existingDiscounts: Discount[];
  isOpen: boolean;
  onClose: () => void;
  onImportDiscounts: (discounts: Discount[]) => Promise<Discount[]>;
};
