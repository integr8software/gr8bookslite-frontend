export type WarehouseStockByLocationModule =
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

export type WarehouseStockByLocationGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseStockByLocationColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseStockByLocationConfig = {
  apiPath: string;
  columns: WarehouseStockByLocationColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseStockByLocationGroup;
  module: WarehouseStockByLocationModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseStockByLocationRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseStockByLocationPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseStockByLocationResponse = {
  permissions: WarehouseStockByLocationPermissions;
  records: WarehouseStockByLocationRecord[];
};
