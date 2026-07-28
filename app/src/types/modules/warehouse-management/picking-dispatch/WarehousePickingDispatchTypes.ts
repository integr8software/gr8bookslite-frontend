export type WarehousePickingDispatchModule = "picking-dispatch";

export type WarehousePickingDispatchGroup = "Warehouse Operations";

export type WarehousePickingDispatchColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehousePickingDispatchConfig = {
  columns: WarehousePickingDispatchColumn[];
  description: string;
  emptyDescription: string;
  group: WarehousePickingDispatchGroup;
  module: WarehousePickingDispatchModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehousePickingDispatchRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehousePickingDispatchPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehousePickingDispatchResponse = {
  permissions: WarehousePickingDispatchPermissions;
  records: WarehousePickingDispatchRecord[];
};
