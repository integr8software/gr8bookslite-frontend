export type WarehouseStockByWarehouseModule =
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

export type WarehouseStockByWarehouseGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseStockByWarehouseColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseStockByWarehouseConfig = {
  apiPath: string;
  columns: WarehouseStockByWarehouseColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseStockByWarehouseGroup;
  module: WarehouseStockByWarehouseModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseStockByWarehouseRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseStockByWarehousePermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseStockByWarehouseResponse = {
  permissions: WarehouseStockByWarehousePermissions;
  records: WarehouseStockByWarehouseRecord[];
};
