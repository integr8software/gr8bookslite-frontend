import type { ReactNode } from "react";
import type { ColumnDef, Table } from "@tanstack/react-table";

export type ItemAttributeStatus = "Active" | "Inactive";
export type ItemAttributeUsage = "Variant" | "Stock Classification" | "Item Detail";
export type ItemAttributeValueStatus = "Active" | "Inactive";
export type ApiItemAttributeStatus = "ACTIVE" | "INACTIVE";
export type ApiItemAttributeUsage = "ITEM_DETAIL" | "STOCK_CLASSIFICATION" | "VARIANT";
export type ApiItemAttributeValueStatus = "ACTIVE" | "INACTIVE";

export type ItemAttributeValue = {
  id: string;
  label: string;
  isUsed: boolean;
  status: ItemAttributeValueStatus;
};

export type ItemAttributeRecord = {
  id: string;
  code: string;
  name: string;
  usage: ItemAttributeUsage;
  values: ItemAttributeValue[];
  requiredOnItem: boolean;
  affectsStock: boolean;
  status: ItemAttributeStatus;
};

export type ApiItemAttributeValue = {
  id: string;
  label: string;
  isUsed: boolean;
  status: ApiItemAttributeValueStatus;
};

export type ApiItemAttribute = {
  id: string;
  code: string;
  name: string;
  usage: ApiItemAttributeUsage;
  values: ApiItemAttributeValue[];
  requiredOnItem: boolean;
  affectsStock: boolean;
  status: ApiItemAttributeStatus;
  createdBy: string | null;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

export type ItemAttributeFormValues = Pick<ItemAttributeRecord, "name" | "values" | "status">;

export type ItemAttributeFormErrors = Partial<Record<keyof ItemAttributeFormValues, string>>;

export type ItemAttributesPermissions = {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canExport: boolean;
  canImport: boolean;
};

export type ItemAttributesStatistics = {
  totalAttributes: number;
  activeAttributes: number;
  inactiveAttributes: number;
  totalValues: number;
  activeValues: number;
  inactiveValues: number;
};

export type ItemAttributesListResponse = {
  attributes: ItemAttributeRecord[];
  permissions: ItemAttributesPermissions;
  statistics: ItemAttributesStatistics;
};

export type ApiItemAttributesListResponse = {
  attributes: ApiItemAttribute[];
  permissions: ItemAttributesPermissions;
  statistics: ItemAttributesStatistics;
};

export type ApiItemAttributeSaveResponse = {
  attribute: ApiItemAttribute;
};

export type ItemAttributeDrawerMode = "add" | "edit" | "view";

export type ItemAttributeDrawerState = {
  mode: ItemAttributeDrawerMode;
  record?: ItemAttributeRecord;
} | null;

export type ItemAttributesTableProps = {
  emptyDescription?: string;
  emptyTitle?: string;
  isLoading: boolean;
  isRefreshing: boolean;
  lastSyncedAt?: number | string | Date | null;
  table: Table<ItemAttributeRecord>;
  toolbar?: ReactNode;
  onEdit: (record: ItemAttributeRecord) => void;
  onToggleStatus: (record: ItemAttributeRecord) => void;
  onView: (record: ItemAttributeRecord) => void;
};

export type ItemAttributesListPageState = {
  activeCount: number;
  drawer: ItemAttributeDrawerState;
  filteredRecords: ItemAttributeRecord[];
  inactiveCount: number;
  isLoading: boolean;
  isLoadError: boolean;
  isMutating: boolean;
  isRefreshing: boolean;
  lastSyncedAt: number;
  loadErrorMessage: string | null;
  pendingStatusRecord: ItemAttributeRecord | null;
  permissions: ItemAttributesPermissions;
  query: string;
  records: ItemAttributeRecord[];
  statistics: ItemAttributesStatistics;
  statusFilter: string;
  table: Table<ItemAttributeRecord>;
  tableColumns: ColumnDef<ItemAttributeRecord>[];
  closeDrawer: () => void;
  openAddDrawer: () => void;
  openEditDrawer: (record: ItemAttributeRecord) => void;
  openViewDrawer: (record: ItemAttributeRecord) => void;
  confirmStatusChange: () => Promise<void>;
  saveRecord: (values: ItemAttributeFormValues) => Promise<void>;
  refreshRecords: () => void;
  setQuery: (value: string) => void;
  setPendingStatusRecord: (record: ItemAttributeRecord | null) => void;
  setStatusFilter: (value: string) => void;
  toggleStatus: (record: ItemAttributeRecord) => Promise<ItemAttributeRecord>;
};
