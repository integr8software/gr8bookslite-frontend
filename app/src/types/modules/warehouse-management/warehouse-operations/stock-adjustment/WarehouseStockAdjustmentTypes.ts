export type WarehouseStockAdjustmentModule =
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

export type WarehouseStockAdjustmentGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseStockAdjustmentColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseStockAdjustmentConfig = {
  apiPath: string;
  columns: WarehouseStockAdjustmentColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseStockAdjustmentGroup;
  module: WarehouseStockAdjustmentModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseStockAdjustmentRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseStockAdjustmentPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseStockAdjustmentResponse = {
  permissions: WarehouseStockAdjustmentPermissions;
  records: WarehouseStockAdjustmentRecord[];
};
