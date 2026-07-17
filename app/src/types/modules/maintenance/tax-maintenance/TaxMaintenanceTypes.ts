import type { ChangeEventHandler } from "react";
import type { Row, Table } from "@tanstack/react-table";
import type { ModuleChartAccount } from "@/app/src/data/shared/accounts/ModuleChartAccountsData";

export type TaxMaintenanceStatus = "Active" | "Inactive";
export type TaxMaintenanceStatusFilter = "" | TaxMaintenanceStatus;

export type ApiTaxMaintenanceStatus = "ACTIVE" | "INACTIVE";

export type TaxMaintenanceAccountSummary = {
  id: string;
  accountCode: string;
  accountTitle: string;
};

export type TaxMaintenance = {
  id: string;
  name: string;
  description: string;
  percentage: string;
  inputVatAccountId: string;
  outputVatAccountId: string;
  deferredVatAccountId: string;
  expandedWithholdingTaxAccountId: string;
  creditableWithholdingTaxAccountId: string;
  withholdingVatableTaxAccountId: string;
  finalWithholdingTaxAccountId: string;
  accounts?: {
    inputVatAccount: TaxMaintenanceAccountSummary | null;
    outputVatAccount: TaxMaintenanceAccountSummary | null;
    deferredVatAccount: TaxMaintenanceAccountSummary | null;
    expandedWithholdingTaxAccount: TaxMaintenanceAccountSummary | null;
    creditableWithholdingTaxAccount: TaxMaintenanceAccountSummary | null;
    withholdingVatableTaxAccount: TaxMaintenanceAccountSummary | null;
    finalWithholdingTaxAccount: TaxMaintenanceAccountSummary | null;
  };
  status: TaxMaintenanceStatus;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};

export type TaxMaintenanceFormValues = Omit<
  TaxMaintenance,
  "accounts" | "createdAt" | "createdBy" | "id" | "updatedAt" | "updatedBy"
>;

export type TaxMaintenanceDefaultAccountIds = Pick<
  TaxMaintenanceFormValues,
  | "creditableWithholdingTaxAccountId"
  | "deferredVatAccountId"
  | "expandedWithholdingTaxAccountId"
  | "finalWithholdingTaxAccountId"
  | "inputVatAccountId"
  | "outputVatAccountId"
  | "withholdingVatableTaxAccountId"
>;

export type ApiTaxMaintenance = {
  id: string;
  name: string;
  description?: string | null;
  percentage: number;
  inputVatAccountId?: string | null;
  outputVatAccountId?: string | null;
  deferredVatAccountId?: string | null;
  expandedWithholdingTaxAccountId?: string | null;
  creditableWithholdingTaxAccountId?: string | null;
  withholdingVatableTaxAccountId?: string | null;
  finalWithholdingTaxAccountId?: string | null;
  accounts?: TaxMaintenance["accounts"];
  status: ApiTaxMaintenanceStatus;
  createdBy?: string | null;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};

export type ApiTaxMaintenanceListResponse = {
  taxMaintenance: ApiTaxMaintenance[];
  accountOptions: ModuleChartAccount[];
  defaultAccountIds: TaxMaintenanceDefaultAccountIds;
  statistics: TaxMaintenanceStatistics;
  permissions: TaxMaintenancePermissions;
};

export type ApiTaxMaintenanceSaveResponse = {
  taxMaintenance: ApiTaxMaintenance;
};

export type TaxMaintenanceListResponse = {
  taxMaintenance: TaxMaintenance[];
  accountOptions: ModuleChartAccount[];
  defaultAccountIds: TaxMaintenanceDefaultAccountIds;
  statistics: TaxMaintenanceStatistics;
  permissions: TaxMaintenancePermissions;
};

export type TaxMaintenancePermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type TaxMaintenanceStatistics = {
  totalTaxes: number;
  activeTaxes: number;
  inactiveTaxes: number;
};

export type TaxMaintenanceStatisticCardsProps = {
  statistics: TaxMaintenanceStatistics;
  isLoading?: boolean;
};

export type TaxMaintenanceDrawerMode = "add" | "edit" | "view";

export type TaxMaintenanceTab = "tax" | "accounting";

export type TaxMaintenanceDrawerState =
  | {
      mode: TaxMaintenanceDrawerMode;
      tax?: TaxMaintenance;
    }
  | null;

export type TaxMaintenanceDrawerProps = {
  accountOptions: ModuleChartAccount[];
  defaultAccountIds: TaxMaintenanceDefaultAccountIds;
  isOpen: boolean;
  isSaving: boolean;
  mode: TaxMaintenanceDrawerMode;
  tax?: TaxMaintenance;
  onClose: () => void;
  onSave: (values: TaxMaintenance | TaxMaintenanceFormValues) => Promise<void>;
};

export type TaxMaintenanceFieldsProps = {
  accountOptions: ModuleChartAccount[];
  errors: Partial<Record<keyof TaxMaintenanceFormValues, string>>;
  isReadonly: boolean;
  values: TaxMaintenanceFormValues;
  onAccountChange: (
    field: TaxMaintenanceAccountField,
    value: string,
  ) => void;
  onInputChange: ChangeEventHandler<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
};

export type TaxMaintenanceAccountField =
  | "creditableWithholdingTaxAccountId"
  | "deferredVatAccountId"
  | "expandedWithholdingTaxAccountId"
  | "finalWithholdingTaxAccountId"
  | "inputVatAccountId"
  | "outputVatAccountId"
  | "withholdingVatableTaxAccountId";

export type TaxMaintenanceTableColumnKey =
  | "createdAt"
  | "createdBy"
  | "creditableWithholdingTaxAccountCode"
  | "creditableWithholdingTaxAccountTitle"
  | "deferredVatAccountCode"
  | "deferredVatAccountTitle"
  | "description"
  | "expandedWithholdingTaxAccountCode"
  | "expandedWithholdingTaxAccountTitle"
  | "finalWithholdingTaxAccountCode"
  | "finalWithholdingTaxAccountTitle"
  | "inputVatAccountCode"
  | "inputVatAccountTitle"
  | "name"
  | "outputVatAccountCode"
  | "outputVatAccountTitle"
  | "percentage"
  | "status"
  | "updatedAt"
  | "updatedBy"
  | "withholdingVatableTaxAccountCode"
  | "withholdingVatableTaxAccountTitle";

export type TaxMaintenanceTableProps = {
  filteredTaxes: TaxMaintenance[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  permissions: TaxMaintenancePermissions;
  query: string;
  statusFilter: TaxMaintenanceStatusFilter;
  taxes: TaxMaintenance[];
  onEditTax: (tax: TaxMaintenance) => void;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: TaxMaintenanceStatusFilter) => void;
  onToggleStatus: (tax: TaxMaintenance) => void;
  onViewTax: (tax: TaxMaintenance) => void;
};

export type TaxMaintenanceTableRowProps = {
  permissions: TaxMaintenancePermissions;
  row: Row<TaxMaintenance>;
  onEditTax: (tax: TaxMaintenance) => void;
  onToggleStatus: (tax: TaxMaintenance) => void;
  onViewTax: (tax: TaxMaintenance) => void;
};

export type TaxMaintenanceTableFiltersProps = {
  exportAllRows: TaxMaintenance[];
  exportFilteredRows: TaxMaintenance[];
  hasActiveFilters: boolean;
  isRefreshing: boolean;
  permissions: TaxMaintenancePermissions;
  query: string;
  statusFilter: TaxMaintenanceStatusFilter;
  table: Table<TaxMaintenance>;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  onStatusFilterChange: (value: TaxMaintenanceStatusFilter) => void;
};
