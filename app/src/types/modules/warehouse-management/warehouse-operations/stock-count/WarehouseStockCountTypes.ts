export type WarehouseStockCountModule =
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

export type WarehouseStockCountGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseStockCountColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseStockCountConfig = {
  apiPath: string;
  columns: WarehouseStockCountColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseStockCountGroup;
  module: WarehouseStockCountModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseStockCountRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseStockCountPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseStockCountResponse = {
  permissions: WarehouseStockCountPermissions;
  records: WarehouseStockCountRecord[];
};
