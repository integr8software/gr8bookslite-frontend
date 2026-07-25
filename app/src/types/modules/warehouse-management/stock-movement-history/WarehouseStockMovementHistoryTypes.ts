export type WarehouseStockMovementHistoryModule =
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

export type WarehouseStockMovementHistoryGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseStockMovementHistoryColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseStockMovementHistoryConfig = {
  columns: WarehouseStockMovementHistoryColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseStockMovementHistoryGroup;
  module: WarehouseStockMovementHistoryModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseStockMovementHistoryRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseStockMovementHistoryPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseStockMovementHistoryResponse = {
  permissions: WarehouseStockMovementHistoryPermissions;
  records: WarehouseStockMovementHistoryRecord[];
};
