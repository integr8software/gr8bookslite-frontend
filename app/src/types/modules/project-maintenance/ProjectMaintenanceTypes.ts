import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";

export type ProjectMaintenanceStatus = "Active" | "Inactive";
export type ProjectMaintenanceType = "Division" | "Department" | "Section" | "Unit";

export type ProjectMaintenanceStatusFilter = "" | ProjectMaintenanceStatus;

export type ProjectMaintenance = {
  id: string;
  projectCode: string;
  projectName: string;
  type: ProjectMaintenanceType;
  description: string;
  status: ProjectMaintenanceStatus;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string | null;
  updatedAt?: string;
};

export type ProjectMaintenanceLookupOption = {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  type: ProjectMaintenanceType;
  name: string;
  label: string;
  value: string;
  description?: string;
  status: ProjectMaintenanceStatus;
};

export type ProjectMaintenanceFormValues = {
  projectCode: string;
  projectName: string;
  type: ProjectMaintenanceType;
  description: string;
  status: ProjectMaintenanceStatus;
};

export type ProjectMaintenanceFormErrors = Partial<Record<keyof ProjectMaintenanceFormValues, string>>;

export type ProjectMaintenanceActionMode = "add" | "edit" | "view";

export type ProjectMaintenanceFormPageOptions = {
  existingProject?: ProjectMaintenance;
  initialValues?: ProjectMaintenanceFormValues;
  isOpen?: boolean;
  mode?: ProjectMaintenanceActionMode;
  onSaved?: (project: ProjectMaintenance) => void;
};

export type ProjectMaintenanceStoreOptions = {
  refetchOnMount?: boolean | "always";
};

export type ProjectMaintenanceDrawerState = {
  initialValues?: ProjectMaintenanceFormValues;
  mode: ProjectMaintenanceActionMode;
  project?: ProjectMaintenance;
} | null;

export type ProjectMaintenanceDrawerProps = {
  initialValues?: ProjectMaintenanceFormValues;
  isOpen: boolean;
  mode: ProjectMaintenanceActionMode;
  onClose: () => void;
  onSaved?: (project: ProjectMaintenance) => void;
  project?: ProjectMaintenance;
};

export type ProjectMaintenanceFieldsProps = {
  errors: ProjectMaintenanceFormErrors;
  isReadonly: boolean;
  values: ProjectMaintenanceFormValues;
  onInputChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  onStatusChange: (value: ProjectMaintenanceFormValues["status"]) => void;
  onTypeChange: (value: ProjectMaintenanceFormValues["type"]) => void;
};

export type ProjectMaintenanceTableColumnKey =
  "projectCode" | "projectName" | "type" | "description" | "status" | "createdBy" | "createdAt" | "updatedBy" | "updatedAt";

export type ProjectMaintenancePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type ProjectMaintenanceStatistics = {
  totalProjects: number;
  activeProjects: number;
  inactiveProjects: number;
};

export type ProjectMaintenanceListResult = {
  projects: ProjectMaintenance[];
  statistics: ProjectMaintenanceStatistics;
  permissions: ProjectMaintenancePermissions;
};

export type ProjectMaintenanceStatisticCardsProps = {
  statistics: ProjectMaintenanceStatistics;
  isLoading?: boolean;
};

export type ProjectMaintenanceTableProps = {
  filteredProjects: ProjectMaintenance[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: ProjectMaintenancePermissions;
  projects: ProjectMaintenance[];
  query: string;
  statusFilter: ProjectMaintenanceStatusFilter;
  onEditProject: (project: ProjectMaintenance) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: ProjectMaintenanceStatusFilter) => void;
  onToggleStatus: (project: ProjectMaintenance) => void;
  onViewProject: (project: ProjectMaintenance) => void;
};

export type ProjectMaintenanceTableRowProps = {
  row: Row<ProjectMaintenance>;
  permissions: ProjectMaintenancePermissions;
  onEditProject: (project: ProjectMaintenance) => void;
  onToggleStatus: (project: ProjectMaintenance) => void;
  onViewProject: (project: ProjectMaintenance) => void;
};

export type ProjectMaintenanceTableFiltersProps = {
  exportAllRows: ProjectMaintenance[];
  exportFilteredRows: ProjectMaintenance[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: ProjectMaintenancePermissions;
  query: string;
  statusFilter: ProjectMaintenanceStatusFilter;
  table: Table<ProjectMaintenance>;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: ProjectMaintenanceStatusFilter) => void;
};
