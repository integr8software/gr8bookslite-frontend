import type {
  StorageLayoutRecord,
  StorageLayoutWarehouse,
} from "@/app/src/types/modules/warehouse-management/storage-layout/StorageLayoutTypes";

export const StorageLayoutWarehouses: StorageLayoutWarehouse[] = [
  { code: "MAIN", id: "wh-main", name: "Main Warehouse" },
  { code: "NORTH", id: "wh-north", name: "North Distribution Hub" },
  { code: "COLD", id: "wh-cold", name: "Cold Storage Facility" },
];

const hierarchy = [
  ["ZONE-A", "Zone A", "Zone", "Warehouse", "12 aisles"],
  ["A01", "Aisle 01", "Aisle", "ZONE-A", "20 racks"],
  ["A01-R01", "Rack 01", "Rack", "A01", "5 levels"],
  ["A01-R01-L01", "Level 01", "Level", "A01-R01", "8 bins"],
  ["A01-R01-L01-B01", "Bin 01", "Bin", "A01-R01-L01", "250 units"],
] as const;

export function createStorageLayoutRecords(): StorageLayoutRecord[] {
  return StorageLayoutWarehouses.flatMap((warehouse, warehouseIndex) =>
    hierarchy.slice(0, Math.max(3, hierarchy.length - warehouseIndex)).map((level, index) => ({
      capacity: level[4],
      code: warehouseIndex === 0 ? level[0] : `${warehouse.code}-${level[0]}`,
      id: `${warehouse.id}-${index + 1}`,
      name: level[1],
      parentCode: level[3],
      sequence: index + 1,
      status: "Active",
      type: level[2],
      warehouseId: warehouse.id,
    })),
  );
}
