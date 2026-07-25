export type WarehouseLocationAvailabilityModule =
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

export type WarehouseLocationAvailabilityGroup =
  "Warehouse Storage" | "Warehouse Inventory" | "Warehouse Operations";

export type WarehouseLocationAvailabilityColumn = {
  id: string;
  label: string;
  className?: string;
};

export type WarehouseLocationAvailabilityConfig = {
  columns: WarehouseLocationAvailabilityColumn[];
  description: string;
  emptyDescription: string;
  group: WarehouseLocationAvailabilityGroup;
  module: WarehouseLocationAvailabilityModule;
  primaryAction?: string;
  readOnly?: boolean;
  searchPlaceholder: string;
  title: string;
  warehouseMode: "all-or-one" | "one";
};

export type WarehouseLocationAvailabilityRecord = {
  cells: Record<string, string>;
  id: string;
  status: string;
  warehouseId: string;
  warehouseName: string;
};

export type WarehouseLocationAvailabilityPermissions = {
  canCreate: boolean;
  canExport: boolean;
  canUpdate: boolean;
  canView: boolean;
};

export type WarehouseLocationAvailabilityResponse = {
  permissions: WarehouseLocationAvailabilityPermissions;
  records: WarehouseLocationAvailabilityRecord[];
};
