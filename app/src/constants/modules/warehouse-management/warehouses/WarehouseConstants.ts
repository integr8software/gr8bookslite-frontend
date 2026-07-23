import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import { WarehouseAccessHref } from "@/app/src/constants/modules/warehouse-management/warehouse-access/WarehouseAccessConstants";
import type { SortingState } from "@tanstack/react-table";
import type { VisibilityState } from "@tanstack/react-table";
import type {
  WarehouseBranchAvailability,
  WarehouseStatus,
  WarehouseTableColumnKey,
  WarehouseTableRecord,
} from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const WarehouseHref = MODULE_ROUTE_MAP.WM;

export const WarehouseApiPath = "/maintenance/warehouse-maintenance";

export const WarehouseTablePaginationStorageKey = "maintenance.warehouses";

export const WarehouseTablePreferencesStorageKey = "gr8booksneo:warehouses:table-preferences";
export const WarehouseTablePreferencesModuleKey = "maintenance:warehouses";
export const WarehouseCardGridPageSizeOptions = [5, 10, 15, 20, 25, 50] as const;
export const WarehouseCardGridSkeletonCount = 8;

export const WarehouseStatusOptions = ["Active", "Inactive"] as const satisfies readonly WarehouseStatus[];

export const WarehouseBranchOptions = ["Main Branch", "North Branch", "South Branch", "Cebu Branch"] as const;

export const WarehouseBranchAvailabilityOptions = [
  "All Branches",
  "Specific Branches",
  "Except Branches",
] as const satisfies readonly WarehouseBranchAvailability[];

export const WarehouseTableColumns: Array<
  | {
      key: WarehouseTableColumnKey;
      label: string;
      className: string;
    }
  | {
      id: "actions";
      label: string;
      className: string;
    }
> = [
  { key: "code", label: "Warehouse Code", className: "w-[12rem]" },
  { key: "name", label: "Warehouse Name", className: "w-[18rem]" },
  { key: "description", label: "Description", className: "w-[22rem]" },
  { key: "address", label: "Location", className: "w-[18rem]" },
  {
    key: "availableBranchLabel",
    label: "Branch",
    className: "w-[14rem]",
  },
  { key: "managerName", label: "Manager", className: "w-[14rem]" },
  { key: "createdBy", label: "Created By", className: "w-[12rem]" },
  { key: "createdAt", label: "Date Created", className: "w-[14rem]" },
  { key: "updatedBy", label: "Updated By", className: "w-[12rem]" },
  { key: "updatedAt", label: "Date Modified", className: "w-[14rem]" },
  { key: "status", label: "Status", className: "w-[9rem] text-center" },
  { id: "actions", label: "Action", className: "w-[10rem] text-center" },
];

export const WarehouseDefaultColumnOrder = WarehouseTableColumns.map((column) => ("key" in column ? column.key : "actions"));

export const WarehouseDefaultSorting: SortingState = [{ id: "name", desc: false }];

export const WarehouseDefaultColumnVisibility: VisibilityState = {
  code: false,
  description: false,
  availableBranchLabel: false,
  managerName: false,
  createdBy: false,
  createdAt: false,
  updatedBy: false,
  updatedAt: false,
};

export const WarehouseExportColumns: ModuleTableExportColumn<WarehouseTableRecord>[] = WarehouseTableColumns.flatMap((column) =>
  "key" in column
    ? [
        {
          header: column.label,
          id: column.key,
          value: column.key,
        },
      ]
    : [],
);

export function getWarehouseTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 10) return "min-w-[132rem]";
  if (visibleColumnCount >= 8) return "min-w-[108rem]";
  if (visibleColumnCount >= 6) return "min-w-[84rem]";
  return "min-w-[58rem]";
}

export const WarehouseFormPageCopy = {
  add: {
    title: "Add Warehouse",
    description: "Create a warehouse location and assign its available branches and manager.",
  },
  edit: {
    title: "Edit Warehouse",
    description: "Update warehouse information used by inventory receiving and issuing workflows.",
  },
  view: {
    title: "Warehouse Management",
    description: "Review warehouse information, available branches, and access assignments.",
  },
} as const;

export function createWarehouseAccessHref(warehouseId: string) {
  return `${WarehouseAccessHref}?warehouseId=${encodeURIComponent(warehouseId)}`;
}

export function createWarehouseItemsHref(warehouseId: string) {
  return `${WarehouseHref}/view/${warehouseId}/items`;
}
