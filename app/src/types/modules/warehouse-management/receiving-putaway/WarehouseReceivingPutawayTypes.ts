export type WarehouseReceivingPutawayModule = "receiving-putaway";

export type WarehouseReceivingPutawayGroup = "Warehouse Operations";

export type WarehouseReceivingPutawayColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseReceivingPutawayConfig = {
  columns: WarehouseReceivingPutawayColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseReceivingPutawayGroup;
  module: WarehouseReceivingPutawayModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseReceivingPutawayRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseReceivingPutawayPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseReceivingPutawayResponse = {
  permissions: WarehouseReceivingPutawayPermissions;
  records: WarehouseReceivingPutawayRecord[];
};
