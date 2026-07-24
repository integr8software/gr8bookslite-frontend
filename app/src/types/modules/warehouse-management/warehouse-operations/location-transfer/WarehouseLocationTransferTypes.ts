export type WarehouseLocationTransferModule =
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

export type WarehouseLocationTransferGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseLocationTransferColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseLocationTransferConfig = {
  apiPath: string;
  columns: WarehouseLocationTransferColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseLocationTransferGroup;
  module: WarehouseLocationTransferModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseLocationTransferRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseLocationTransferPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseLocationTransferResponse = {
  permissions: WarehouseLocationTransferPermissions;
  records: WarehouseLocationTransferRecord[];
};
