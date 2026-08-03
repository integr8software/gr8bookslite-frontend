export type DeliveryVehicleFeatureKey =
  | "delivery-vehicles"
  | "vehicle-types"
  | "vehicle-repair-maintenance";

export type DeliveryVehicleFieldType = "text" | "number" | "date" | "datetime-local" | "select" | "textarea";

export type DeliveryVehicleField = {
  key: string;
  label: string;
  options?: readonly string[];
  required?: boolean;
  type?: DeliveryVehicleFieldType;
  defaultValue?: string;
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
  updatedAt: string;
};

export type DeliveryVehicleModuleConfig = {
  key: DeliveryVehicleFeatureKey;
  code: string;
  title: string;
  description: string;
  primaryAction: string;
  noun: string;
  searchPlaceholder: string;
  statuses: readonly string[];
  categories?: readonly string[];
  fields: readonly DeliveryVehicleField[];
  tableFieldKeys: readonly string[];
  insightLabel: string;
  insightStatuses: readonly string[];
  operationalNote: string;
};

export type DeliveryVehicleEditorState =
  | { mode: "add" }
  | { mode: "edit" | "view"; record: DeliveryVehicleModuleRecord }
  | null;

export type DeliveryVehicleModulePageState = {
  categoryFilter: string;
  config: DeliveryVehicleModuleConfig;
  editor: DeliveryVehicleEditorState;
  filteredRecords: DeliveryVehicleModuleRecord[];
  isRefreshing: boolean;
  lastSyncedAt: Date;
  pendingAdvance: DeliveryVehicleModuleRecord | null;
  query: string;
  records: DeliveryVehicleModuleRecord[];
  statistics: {
    total: number;
    attention: number;
    insight: number;
    averageProgress: number;
  };
  statusFilter: string;
  table: import("@tanstack/react-table").Table<DeliveryVehicleModuleRecord>;
  validateRecord: (values: Record<string, string>) => Record<string, string>;
  advanceRecord: (record: DeliveryVehicleModuleRecord) => void;
  refreshRecords: () => void;
  resetFilters: () => void;
  saveRecord: (
    values: Record<string, string>,
    status: string,
    category: string | undefined,
    existing?: DeliveryVehicleModuleRecord,
  ) => void;
  setCategoryFilter: (value: string) => void;
  setEditor: (value: DeliveryVehicleEditorState) => void;
  setPendingAdvance: (value: DeliveryVehicleModuleRecord | null) => void;
  setQuery: (value: string) => void;
  setStatusFilter: (value: string) => void;
};
