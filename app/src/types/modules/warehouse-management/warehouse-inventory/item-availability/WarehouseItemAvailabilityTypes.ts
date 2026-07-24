export type WarehouseItemAvailabilityModule =
  | "capacity-storage-rules"
  | "item-availability"
  | "item-location-setup"
  | "location-availability"
  | "location-transfer"
  | "picking-dispatch"
  | "receiving-putaway"
  | "stock-adjustment"
  | "stock-by-location"
  | "stock-by-warehouse"
  | "stock-count"
  | "stock-movement-history";

export type WarehouseItemAvailabilityGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseItemAvailabilityColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseItemAvailabilityConfig = {
  apiPath: string;
  columns: WarehouseItemAvailabilityColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseItemAvailabilityGroup;
  module: WarehouseItemAvailabilityModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseItemAvailabilityRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseItemAvailabilityPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseItemAvailabilityResponse = {
  permissions: WarehouseItemAvailabilityPermissions;
  records: WarehouseItemAvailabilityRecord[];
};
