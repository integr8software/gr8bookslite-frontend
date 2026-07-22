import type { ReactNode } from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";

export type ItemVariationStatus = "Active" | "Inactive";
export type ItemVariationUsage = "Variant" | "Stock Classification" | "Item Detail";
export type ItemVariationValueStatus = "Active" | "Inactive";
export type ApiItemVariationStatus = "ACTIVE" | "INACTIVE";
export type ApiItemVariationUsage = "ITEM_DETAIL" | "STOCK_CLASSIFICATION" | "VARIANT";
export type ApiItemVariationValueStatus = "ACTIVE" | "INACTIVE";

export type ItemVariationValue = {
  id: string;
  label: string;
  isUsed: boolean;
  status: ItemVariationValueStatus;
};

export type ItemVariationRecord = {
  id: string;
  code: string;
  name: string;
  usage: ItemVariationUsage;
  values: ItemVariationValue[];
  requiredOnItem: boolean;
  affectsStock: boolean;
  status: ItemVariationStatus;
};

export type ApiItemVariationValue = {
  id: string;
  label: string;
  isUsed: boolean;
  status: ApiItemVariationValueStatus;
};

export type ApiItemVariation = {
  id: string;
  code: string;
  name: string;
  usage: ApiItemVariationUsage;
  values: ApiItemVariationValue[];
  requiredOnItem: boolean;
  affectsStock: boolean;
  status: ApiItemVariationStatus;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type ItemVariationFormValues = Pick<ItemVariationRecord, "name" | "values" | "status">;

export type ItemVariationFormErrors = Partial<Record<keyof ItemVariationFormValues, string>>;

export type ItemVariationsPermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type ItemVariationsStatistics = {
  totalVariations: number;
  activeVariations: number;
  inactiveVariations: number;
  totalValues: number;
  activeValues: number;
  inactiveValues: number;
};

export type ItemVariationsListResponse = {
  variations: ItemVariationRecord[];
  permissions: ItemVariationsPermissions;
  statistics: ItemVariationsStatistics;
};

export type ApiItemVariationsListResponse = {
  variations: ApiItemVariation[];
  permissions: ItemVariationsPermissions;
  statistics: ItemVariationsStatistics;
};

export type ApiItemVariationSaveResponse = {
  variation: ApiItemVariation;
};

export type ItemVariationDrawerMode = "add" | "edit" | "view";

export type ItemVariationDrawerState = {
  mode: ItemVariationDrawerMode;
  record?: ItemVariationRecord;
} | null;

export type ItemVariationsTableProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  table: Table<ItemVariationRecord>;
  toolbar?: ReactNode;
  onEdit: (record: ItemVariationRecord) => void;
  onToggleStatus: (record: ItemVariationRecord) => void;
  onView: (record: ItemVariationRecord) => void;
};

export type ItemVariationsListPageState = {
  activeCount: number;
  drawer: ItemVariationDrawerState;
  filteredRecords: ItemVariationRecord[];
  inactiveCount: number;
  isLoading: boolean;
  isLoadError: boolean;
  isMutating: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  loadErrorMessage: string | null;
  pendingStatusRecord: ItemVariationRecord | null;
  permissions: ItemVariationsPermissions;
  query: string;
  records: ItemVariationRecord[];
  statistics: ItemVariationsStatistics;
  statusFilter: string;
  table: Table<ItemVariationRecord>;
  tableColumns: ColumnDef<ItemVariationRecord>[];
  closeDrawer: () => void;
  openAddDrawer: () => void;
  openEditDrawer: (record: ItemVariationRecord) => void;
  openViewDrawer: (record: ItemVariationRecord) => void;
  confirmStatusChange: () => Promise<void>;
  saveRecord: (values: ItemVariationFormValues) => Promise<void>;
  refreshRecords: () => void;
  setQuery: (value: string) => void;
  setPendingStatusRecord: (record: ItemVariationRecord | null) => void;
  setStatusFilter: (value: string) => void;
  toggleStatus: (record: ItemVariationRecord) => Promise<ItemVariationRecord>;
};
