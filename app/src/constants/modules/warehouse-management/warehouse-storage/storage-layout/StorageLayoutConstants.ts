import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { StorageLayoutLevelType } from "@/app/src/types/modules/warehouse-management/warehouse-storage/storage-layout/StorageLayoutTypes";

export const StorageLayoutHref = MODULE_ROUTE_MAP.WLY;
export const StorageLayoutTitle = "Storage Layout";
export const StorageLayoutDescription =
  "Configure each warehouse hierarchy from zones and aisles down to racks, levels, shelves, and bins.";

export const StorageLayoutLevelTypes: StorageLayoutLevelType[] = [
  "Zone",
  "Aisle",
  "Rack",
  "Level",
  "Shelf",
  "Bin",
];
