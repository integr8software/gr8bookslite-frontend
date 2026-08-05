export type DeliveryVehicleFeatureKey = "delivery-vehicles" | "vehicle-types" | "vehicle-repair-maintenance";

export type DeliveryVehicleFieldType = "text" | "number" | "date" | "datetime-local" | "select" | "textarea";

export type DeliveryVehicleField = {
  helper?: string;
  key: string;
  label: string;
  maxLength?: number;
  options?: readonly string[];
  placeholder?: string;
  required?: boolean;
  tooltip?: string;
  type?: DeliveryVehicleFieldType;
  unitSuffix?: string;
  defaultValue?: string;
};

export type DeliveryVehicleFieldTab = {
  description?: string;
  label: string;
  fieldKeys: readonly string[];
};

export type DeliveryVehicleModuleRecord = {
  id: string;
  code: string;
  name: string;
  status: string;
  category?: string;
  progress?: number;
  alert?: string;
  fields: Record<string, string>;
  createdBy: string;
  createdAt: string;
  updatedBy?: string | null;
  updatedAt: string;
};

export type DeliveryVehicleModuleConfig = {
  key: DeliveryVehicleFeatureKey;
  title: string;
  description: string;
  dispatchQueueStatuses?: readonly string[];
  formDescription?: string;
  primaryAction: string;
  noun: string;
  searchPlaceholder: string;
  statuses: readonly string[];
  fieldTabs?: readonly DeliveryVehicleFieldTab[];
  fields: readonly DeliveryVehicleField[];
  hideReferenceColumn?: boolean;
  tableFieldKeys: readonly string[];
  insightLabel: string;
  insightStatuses: readonly string[];
  operationalNote: string;
};

export type DeliveryVehicleEditorState = { mode: "add" } | { mode: "edit" | "view"; record: DeliveryVehicleModuleRecord } | null;

export type DeliveryVehicleImportProgress = { imported: number; total: number };

export type DeliveryVehicleImportPreviewRow = {
  cellErrors: Record<string, string[] | undefined>;
  cellWarnings: Record<string, string[] | undefined>;
  id: string;
  rowErrors: string[];
  rowNumber: number;
  values: Record<string, string>;
};

export type DeliveryVehicleModulePageState = {
  config: DeliveryVehicleModuleConfig;
  editor: DeliveryVehicleEditorState;
  filteredRecords: DeliveryVehicleModuleRecord[];
  isRefreshing: boolean;
  lastSyncedAt: Date;
  pendingAdvance: DeliveryVehicleModuleRecord | null;
  pendingStatusRecord: DeliveryVehicleModuleRecord | null;
  query: string;
  records: DeliveryVehicleModuleRecord[];
  statusFilter: string;
  workTypeFilter: string;
  workTypeFilterOptions: readonly string[];
  statistics: {
    total: number;
    attention: number;
    insight: number;
    active: number;
    hazardous: number;
    inactive: number;
    dispatchQueue: number;
    inTransit: number;
    averageProgress: number;
    scheduledWorkOrders: number;
    activeWorkOrders: number;
    completedWorkOrders: number;
  };
  table: import("@tanstack/react-table").Table<DeliveryVehicleModuleRecord>;
  validateRecord: (values: Record<string, string>) => Record<string, string>;
  advanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  confirmStatusChange: () => void;
  importRecords: (rows: Array<Record<string, string>>) => void;
  refreshRecords: () => void;
  resetFilters: () => void;
  saveRecord: (
    values: Record<string, string>,
    status: string,
    category: string | undefined,
    existing?: DeliveryVehicleModuleRecord,
  ) => void;
  setEditor: (value: DeliveryVehicleEditorState) => void;
  setPendingAdvance: (value: DeliveryVehicleModuleRecord | null) => void;
  setPendingStatusRecord: (value: DeliveryVehicleModuleRecord | null) => void;
  setQuery: (value: string) => void;
  setStatusFilter: (value: string) => void;
  setVehicleTypeFilter: (value: string) => void;
  setWorkTypeFilter: (value: string) => void;
  vehicleTypeFilter: string;
  vehicleTypeFilterOptions: readonly string[];
};

export type DeliveryVehicleModuleListPageProps = {
  pageConfig: DeliveryVehicleModuleConfig;
  paginationKey: string;
  createRecord: (values: Record<string, string>, status: string, category?: string) => DeliveryVehicleModuleRecord;
  initialRecords: DeliveryVehicleModuleRecord[];
  validateRecord: (values: Record<string, string>) => Record<string, string>;
};

export type DeliveryVehicleModuleListViewProps = {
  page: DeliveryVehicleModulePageState;
  paginationKey: string;
};
