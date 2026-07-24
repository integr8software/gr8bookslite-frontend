export type WarehouseCapacityStorageRulesModule =
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

export type WarehouseCapacityStorageRulesGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseCapacityStorageRulesColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseCapacityStorageRulesConfig = {
  apiPath: string;
  columns: WarehouseCapacityStorageRulesColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseCapacityStorageRulesGroup;
  module: WarehouseCapacityStorageRulesModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseCapacityStorageRulesRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseCapacityStorageRulesPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseCapacityStorageRulesResponse = {
  permissions: WarehouseCapacityStorageRulesPermissions;
  records: WarehouseCapacityStorageRulesRecord[];
};
