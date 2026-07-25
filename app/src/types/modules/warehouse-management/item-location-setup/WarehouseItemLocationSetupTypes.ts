export type WarehouseItemLocationSetupModule =
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

export type WarehouseItemLocationSetupGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseItemLocationSetupColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseItemLocationSetupConfig = {
  columns: WarehouseItemLocationSetupColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseItemLocationSetupGroup;
  module: WarehouseItemLocationSetupModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseItemLocationSetupRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseItemLocationSetupPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseItemLocationSetupResponse = {
  permissions: WarehouseItemLocationSetupPermissions;
  records: WarehouseItemLocationSetupRecord[];
};
