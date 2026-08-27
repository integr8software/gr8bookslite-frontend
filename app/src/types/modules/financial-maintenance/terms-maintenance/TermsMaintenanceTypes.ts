import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type TermsMaintenanceDatemode = "Day" | "Month" | "Year";

export type TermsMaintenanceStatus = "Active" | "Inactive";

export type TermsMaintenanceDatemodeFilter = "All" | TermsMaintenanceDatemode;

export type TermsMaintenanceStatusFilter = "" | TermsMaintenanceStatus;

export type TermsMaintenance = {
  id: string;
  name: string;
  description: string;
  datemode: TermsMaintenanceDatemode;
  period: string;
  status: TermsMaintenanceStatus;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type TermsMaintenanceFormValues = {
  name: string;
  description: string;
  datemode: TermsMaintenanceDatemode;
  period: string;
  status: TermsMaintenanceStatus;
};

export type TermsMaintenanceFormErrors = Partial<Record<keyof TermsMaintenanceFormValues, string>>;

export type TermsMaintenanceActionMode = "add" | "edit" | "view";

export type TermsMaintenanceFormPageOptions = {
  existingTerm?: TermsMaintenance;
  initialValues?: TermsMaintenanceFormValues;
  isOpen?: boolean;
  mode?: TermsMaintenanceActionMode;
  onSaved?: () => void;
};

export type TermsMaintenanceStoreOptions = {
  refetchOnMount?: boolean | "always";
};

export type TermsMaintenanceDrawerState = {
  initialValues?: TermsMaintenanceFormValues;
  mode: TermsMaintenanceActionMode;
  term?: TermsMaintenance;
} | null;

export type TermsMaintenanceDrawerProps = {
  initialValues?: TermsMaintenanceFormValues;
  isOpen: boolean;
  mode: TermsMaintenanceActionMode;
  onClose: () => void;
  term?: TermsMaintenance;
};

export type TermsMaintenanceFieldsProps = {
  errors: TermsMaintenanceFormErrors;
  isReadonly: boolean;
  values: TermsMaintenanceFormValues;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
  onStatusChange: (value: TermsMaintenanceFormValues["status"]) => void;
};

export type TermsMaintenanceTableColumnKey =
  "name" | "description" | "datemode" | "period" | "status" | "createdBy" | "createdAt" | "updatedBy" | "updatedAt";

export type TermsMaintenancePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type TermsMaintenanceStatistics = {
  totalTerms: number;
  activeTerms: number;
  inactiveTerms: number;
  dayTerms: number;
  monthTerms: number;
  yearTerms: number;
};

export type TermsMaintenanceListResult = {
  terms: TermsMaintenance[];
  statistics: TermsMaintenanceStatistics;
  permissions: TermsMaintenancePermissions;
};

export type TermsMaintenanceLookupResult = {
  terms: TermsMaintenance[];
};

export type TermsMaintenanceStatisticCardsProps = {
  statistics: TermsMaintenanceStatistics;
  isLoading?: boolean;
};

export type TermsMaintenanceTableProps = {
  datemodeFilter: TermsMaintenanceDatemodeFilter;
  filteredTerms: TermsMaintenance[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  query: string;
  statusFilter: TermsMaintenanceStatusFilter;
  terms: TermsMaintenance[];
  permissions: TermsMaintenancePermissions;
  onDatemodeFilterChange: (value: TermsMaintenanceDatemodeFilter) => void;
  onEditTerm: (term: TermsMaintenance) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: TermsMaintenanceStatusFilter) => void;
  onToggleStatus: (term: TermsMaintenance) => void;
  onViewTerm: (term: TermsMaintenance) => void;
};

export type TermsMaintenanceTableRowProps = {
  row: Row<TermsMaintenance>;
  permissions: TermsMaintenancePermissions;
  onEditTerm: (term: TermsMaintenance) => void;
  onToggleStatus: (term: TermsMaintenance) => void;
  onViewTerm: (term: TermsMaintenance) => void;
};

export type TermsMaintenanceTableFiltersProps = {
  datemodeFilter: TermsMaintenanceDatemodeFilter;
  exportAllRows: TermsMaintenance[];
  exportFilteredRows: TermsMaintenance[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: TermsMaintenancePermissions;
  query: string;
  statusFilter: TermsMaintenanceStatusFilter;
  table: Table<TermsMaintenance>;
  onDatemodeFilterChange: (value: TermsMaintenanceDatemodeFilter) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: TermsMaintenanceStatusFilter) => void;
};

export type TermImportColumnId = "name" | "datemode" | "period";

export type TermImportColumnHeader = {
  className: string;
  id: TermImportColumnId;
  label: string;
  stickyLeft?: number;
};

export type TermImportColumnWidths = Record<TermImportColumnId, number>;

export type TermImportCellErrors = Partial<Record<TermImportColumnId, string[]>>;

export type TermImportCellWarnings = Partial<Record<TermImportColumnId, string[]>>;

export type TermImportPreviewRow = {
  cellErrors: TermImportCellErrors;
  cellWarnings: TermImportCellWarnings;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  term: Omit<TermsMaintenance, "id">;
};

export type TermImportProgress = {
  imported: number;
  total: number;
};

export type TermImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ImportProgress = TermImportProgress;

export type TermsMaintenanceImportDialogProps = {
  existingTerms: TermsMaintenance[];
  isOpen: boolean;
  onClose: () => void;
  onImportTerms: (terms: TermsMaintenance[]) => Promise<TermsMaintenance[]>;
};
