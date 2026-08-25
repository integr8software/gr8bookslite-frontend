import type { ChangeEventHandler, ReactNode } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { ServiceMaintenanceNextAccountCodeResponseDto } from "@/app/src/generated/api/gR8BooksNeoAPI.schemas";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";

export type ServicesMaintenanceStatus = "Active" | "Inactive";
export type ServicesMaintenanceAccountSetupMode = "Auto" | "Existing";

export type ServicesMaintenance = {
  id: string;
  serviceName: string;
  description: string;
  status: ServicesMaintenanceStatus;
  accountSetupMode: ServicesMaintenanceAccountSetupMode;
  revenueCoaId: string;
  revenueAccountCode: string;
  revenueAccountTitle: string;
  isGeneratedRevenueAccount: boolean;
  createdBy?: string | null;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type ServicesMaintenanceFormValues = {
  serviceName: string;
  description: string;
  status: ServicesMaintenanceStatus;
  accountSetupMode: ServicesMaintenanceAccountSetupMode;
  revenueCoaId: string;
};

export type ServicesMaintenanceFormErrors = Partial<Record<keyof ServicesMaintenanceFormValues, string>>;

export type ServicesMaintenanceActionMode = "add" | "edit" | "view";

export type ServicesMaintenanceFormPageOptions = {
  existingService?: ServicesMaintenance;
  isOpen?: boolean;
  mode?: ServicesMaintenanceActionMode;
  onSaved?: () => void;
};

export type ServicesMaintenanceStatusFilter = "" | ServicesMaintenanceStatus;
export type ServicesMaintenanceSetupModeFilter = "" | ServicesMaintenanceAccountSetupMode;

export type ServicesMaintenanceTableColumnKey =
  | "serviceName"
  | "description"
  | "revenueAccountCode"
  | "revenueAccountTitle"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedBy"
  | "updatedAt";

export type ServicesMaintenancePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type ServicesMaintenanceStatistics = {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  accountTitles: number;
};

export type ServicesMaintenanceListResult = {
  services: ServicesMaintenance[];
  statistics: ServicesMaintenanceStatistics;
  permissions: ServicesMaintenancePermissions;
};

export type ServicesMaintenanceDrawerState = {
  mode: ServicesMaintenanceActionMode;
  service?: ServicesMaintenance;
} | null;

export type ServicesMaintenanceDrawerProps = {
  isOpen: boolean;
  mode: ServicesMaintenanceActionMode;
  onClose: () => void;
  service?: ServicesMaintenance;
};

export type ServicesMaintenanceFieldsProps = {
  errors: ServicesMaintenanceFormErrors;
  isReadonly: boolean;
  values: ServicesMaintenanceFormValues;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
};

export type ServicesMaintenanceAccountingSetupTabProps = {
  accountOptions: ModuleChartAccount[];
  errors: ServicesMaintenanceFormErrors;
  isAccountCodeLoading: boolean;
  isReadonly: boolean;
  mode: ServicesMaintenanceActionMode;
  nextAccountCode: ServiceMaintenanceNextAccountCodeResponseDto | null;
  selectedService?: ServicesMaintenance;
  values: ServicesMaintenanceFormValues;
  onAccountSetupModeChange: (value: ServicesMaintenanceAccountSetupMode) => void;
  onAddAccountTitle: () => void;
  onRevenueAccountChange: (value: string) => void;
};

export type ServicesMaintenanceFormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: string;
  helper?: string;
  label: string;
  required?: boolean;
};

export type ServicesMaintenanceTableProps = {
  filteredServices: ServicesMaintenance[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: ServicesMaintenancePermissions;
  query: string;
  services: ServicesMaintenance[];
  statusFilter: ServicesMaintenanceStatusFilter;
  onEditService: (service: ServicesMaintenance) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: ServicesMaintenanceStatusFilter) => void;
  onToggleStatus: (service: ServicesMaintenance) => void;
  onViewService: (service: ServicesMaintenance) => void;
};

export type ServicesMaintenanceTableFiltersProps = {
  exportAllRows: ServicesMaintenance[];
  exportFilteredRows: ServicesMaintenance[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: ServicesMaintenancePermissions;
  query: string;
  statusFilter: ServicesMaintenanceStatusFilter;
  table: Table<ServicesMaintenance>;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: ServicesMaintenanceStatusFilter) => void;
};

export type ServicesMaintenanceTableRowProps = {
  permissions: ServicesMaintenancePermissions;
  row: Row<ServicesMaintenance>;
  onEditService: (service: ServicesMaintenance) => void;
  onToggleStatus: (service: ServicesMaintenance) => void;
  onViewService: (service: ServicesMaintenance) => void;
};

export type ServicesMaintenanceCellContentProps = {
  columnId: string;
  permissions: ServicesMaintenancePermissions;
  service: ServicesMaintenance;
  onEditService: (service: ServicesMaintenance) => void;
  onToggleStatus: (service: ServicesMaintenance) => void;
  onViewService: (service: ServicesMaintenance) => void;
};

export type ServicesMaintenanceImportColumnId = "serviceName" | "description" | "accountSetupMode" | "revenueCoaId";

export type ServicesMaintenanceImportColumnHeader = {
  className: string;
  id: ServicesMaintenanceImportColumnId;
  label: string;
  stickyLeft?: number;
};

export type ServicesMaintenanceImportColumnWidths = Record<ServicesMaintenanceImportColumnId, number>;

export type ServicesMaintenanceImportCellErrors = Partial<Record<ServicesMaintenanceImportColumnId, string[]>>;

export type ServicesMaintenanceImportPreviewRow = {
  cellErrors: ServicesMaintenanceImportCellErrors;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  service: ServicesMaintenanceFormValues;
};

export type ServicesMaintenanceImportProgress = {
  imported: number;
  total: number;
};

export type ServicesMaintenanceImportMode = "all-rows" | "all-valid" | "selected-valid";

export type ServicesMaintenanceImportDialogProps = {
  existingServices: ServicesMaintenance[];
  isOpen: boolean;
  onClose: () => void;
  onImportServices: (services: ServicesMaintenanceFormValues[]) => Promise<ServicesMaintenance[]>;
};
