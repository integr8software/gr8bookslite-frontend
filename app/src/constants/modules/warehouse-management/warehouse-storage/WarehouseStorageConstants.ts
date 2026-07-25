import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const WarehouseStorageHref = MODULE_ROUTE_MAP.WS;

export const WarehouseStorageApiPath = "/maintenance/warehouse-storage";

export const WarehouseStorageTitle = "Storage Locations";

export const WarehouseStorageDescription =
  "Maintain warehouse-scoped storage locations, structured paths, and storage codes.";

export const WarehouseStorageActionLabel = "Add Location";

export const WarehouseStorageTableHeaders = [
  "Storage Code",
  "Location Name",
  "Warehouse",
  "Path",
  "Purpose",
  "Status",
] as const;

export const WarehouseStorageTableColumns = [
  {
    id: "storageCode",
    label: "Storage Code",
    valueIndex: 0,
    className: "w-[14rem]",
  },
  {
    id: "locationName",
    label: "Location Name",
    valueIndex: 1,
    className: "w-[16rem]",
  },
  { id: "warehouse", label: "Warehouse", valueIndex: 2, className: "w-[14rem]" },
  {
    id: "path",
    label: "Path",
    valueIndex: 3,
    className: "w-[22rem]",
  },
  { id: "type", label: "Purpose", valueIndex: 4, className: "w-[12rem]" },
  {
    id: "status",
    label: "Status",
    valueIndex: 6,
    className: "w-[10rem] text-center",
  },
  { id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

export const WarehouseStoragePaginationStorageKey = "maintenance.warehouse-storage";

export const WarehouseStorageStatusOptions = ["Active", "Reserved", "Blocked", "Inactive"] as const;

export const WarehouseStorageTypeOptions = [
  "General Storage",
  "Receiving",
  "Picking",
  "Pallet",
  "Case",
  "Cold Storage",
  "Display",
] as const;

export const WarehouseStorageViewModeOptions = ["List", "Map"] as const;
