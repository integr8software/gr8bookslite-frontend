import type { WarehouseAccessLevel, WarehouseAccessPermission } from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";

export type WarehouseModulePageKind = "access" | "stock-inquiry" | "warehouse-storage" | "transfers";

export type WarehouseEditableSupportKind = Exclude<WarehouseModulePageKind, "stock-inquiry">;

export type WarehouseModuleActionMode = "add" | "edit" | "view";

export type WarehouseModuleRecord = {
  id: string;
  kind: WarehouseModulePageKind;
  recordId: string;
  status: string;
  values: string[];
  warehouseId: string;
};

export type WarehouseModuleFormValues = {
  accessLevel: WarehouseAccessLevel;
  approvedBy: string;
  aisle: string;
  balance: string;
  binNo: string;
  date: string;
  destinationWarehouse: string;
  item: string;
  capacity: string;
  capacityUom: string;
  locationCode: string;
  locationName: string;
  locationType: string;
  notes: string;
  permissions: WarehouseAccessPermission[];
  quantityIn: string;
  quantityOut: string;
  rackNo: string;
  referenceNumber: string;
  requestedBy: string;
  room: string;
  shelfNo: string;
  sourceWarehouse: string;
  status: string;
  temperatureZone: string;
  transactionType: string;
  user: string;
  userEmail: string;
  userId: string;
  userName: string;
  warehouseId: string;
  zone: string;
};
