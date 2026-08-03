import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { WarehouseAccessLevel, WarehouseAccessPermission } from "@/app/src/types/modules/warehouse-management/warehouse-access/WarehouseAccessTypes";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const WarehouseAccessHref = MODULE_ROUTE_MAP.WA;

export const WarehouseAccessApiPath = "/maintenance/warehouse-access";

export const WarehouseAccessTitle = "Warehouse Access";

export const WarehouseAccessDescription = "Control which users can view, receive, issue, transfer, adjust, manage locations, and view warehouse history.";

export const WarehouseAccessActionLabel = "Add Access";

export const WarehouseAccessDefaultPermission: WarehouseAccessPermission = "View Stock";

export const WarehouseAccessUserSkeletonCount = 8;

export const WarehouseAccessWarehouseSkeletonCount = 5;

export const WarehouseAccessPermissionSkeletonCount = 7;

export const WarehouseAccessRecordFieldSkeletonCount = 3;

export const WarehouseAccessPrimaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-skyblue px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 disabled:opacity-50";

export const WarehouseAccessSecondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-darknavy/15 bg-white px-4 text-sm font-semibold transition hover:bg-offwhite disabled:opacity-40";

export const WarehouseAccessFieldClassName =
  "min-h-11 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-medium text-darknavy outline-none transition placeholder:text-darknavy/35 focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 disabled:cursor-default disabled:bg-offwhite/65 disabled:text-darknavy read-only:bg-offwhite/65";

export const WarehouseAccessCompactFieldClassName =
  "h-10 w-full rounded-md border border-darknavy/15 bg-white px-3 text-sm font-normal outline-none focus:border-skyblue focus:ring-2 focus:ring-skyblue/15";

export const WarehouseAccessLinkButtonClassName = "text-xs font-semibold text-skyblue transition hover:text-darknavy disabled:opacity-40";

export const WarehouseAccessPermissionDescriptions: Record<WarehouseAccessPermission, string> = {
  "View Stock": "View inventory quantities",
  "Receive Stock": "Record incoming inventory",
  "Issue Stock": "Release warehouse stock",
  "Transfer Stock": "Move stock between warehouses",
  "Adjust Stock": "Correct inventory quantities",
  "Manage Locations": "Maintain warehouse storage",
  "View History": "Review stock movements",
};

export const WarehouseAccessTableHeaders = ["Warehouse", "User", "Permissions", "Status"] as const;

export const WarehouseAccessTableColumns = [
  { id: "warehouse", label: "Warehouse", valueIndex: 0, className: "w-[14rem]" },
  { id: "user", label: "User", valueIndex: 1, className: "w-[14rem]" },
  {
    id: "permissions",
    label: "Permissions",
    valueIndex: 2,
    className: "w-[26rem]",
  },
  {
    id: "status",
    label: "Status",
    valueIndex: 3,
    className: "w-[10rem] text-center",
  },
  { id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

export const WarehouseAccessExportColumns: ModuleTableExportColumn<WarehouseModuleRecord>[] = WarehouseAccessTableColumns.flatMap((column) =>
  "valueIndex" in column
    ? [
        {
          header: column.label,
          id: column.id,
          value: (row) => row.values[column.valueIndex] ?? "",
        },
      ]
    : [],
);

export function getWarehouseAccessTableMinWidthClassName(visibleColumnCount: number) {
  if (visibleColumnCount >= 10) return "min-w-[136rem]";
  if (visibleColumnCount === 9) return "min-w-[122rem]";
  if (visibleColumnCount === 8) return "min-w-[108rem]";
  if (visibleColumnCount === 7) return "min-w-[94rem]";
  if (visibleColumnCount === 6) return "min-w-[80rem]";
  return "min-w-[64rem]";
}

export const WarehouseAccessPaginationStorageKey = "maintenance.warehouse-access";

export const WarehouseAccessStatusOptions = ["Active", "Inactive"] as const;

export const WarehouseAccessLevelOptions = ["Viewer", "Picker", "Manager"] as const satisfies readonly WarehouseAccessLevel[];

export const WarehouseAccessPermissionOptions = [
  "View Stock",
  "Receive Stock",
  "Issue Stock",
  "Transfer Stock",
  "Adjust Stock",
  "Manage Locations",
  "View History",
] as const satisfies readonly WarehouseAccessPermission[];

export const WarehouseAccessPickerDefaultPermissions = ["View Stock", "Issue Stock", "Transfer Stock"] as const satisfies readonly WarehouseAccessPermission[];

export const WarehouseAccessViewerDefaultPermissions = [
  WarehouseAccessDefaultPermission,
  "View History",
] as const satisfies readonly WarehouseAccessPermission[];

export const WarehouseAccessStockMovementPermissions = [
  "Issue Stock",
  "Transfer Stock",
  "Receive Stock",
] as const satisfies readonly WarehouseAccessPermission[];
