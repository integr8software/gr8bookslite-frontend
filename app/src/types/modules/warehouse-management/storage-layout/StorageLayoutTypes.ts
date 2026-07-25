export type StorageLayoutLevelType = "Zone" | "Aisle" | "Rack" | "Level" | "Shelf" | "Bin";

export type StorageLayoutRecord = {
  capacity: string;
  code: string;
  id: string;
  name: string;
  parentCode: string;
  sequence: number;
  status: "Active" | "Inactive";
  type: StorageLayoutLevelType;
  warehouseId: string;
};

export type StorageLayoutDraft = Omit<StorageLayoutRecord, "id">;

export type StorageLayoutWarehouse = {
  code: string;
  id: string;
  name: string;
};
