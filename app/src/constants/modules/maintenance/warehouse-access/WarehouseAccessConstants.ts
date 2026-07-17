import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
	WarehouseAccessLevel,
	WarehouseAccessPermission,
} from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const WarehouseAccessHref = MODULE_ROUTE_MAP.WA;

export const WarehouseAccessApiPath = "/maintenance/warehouse-access";

export const WarehouseAccessTitle = "Warehouse Access";

export const WarehouseAccessDescription =
	"Control which users can view, receive, issue, transfer, adjust, manage locations, and view warehouse history.";

export const WarehouseAccessActionLabel = "Add Access";

export const WarehouseAccessTableHeaders = [
	"Warehouse",
	"User",
	"Permissions",
	"Status",
] as const;

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

export const WarehouseAccessExportColumns: ModuleTableExportColumn<WarehouseModuleRecord>[] =
	WarehouseAccessTableColumns.flatMap((column) =>
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

export function getWarehouseAccessTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}

export const WarehouseAccessPaginationStorageKey =
	"maintenance.warehouse-access";

export const WarehouseAccessStatusOptions = ["Active", "Inactive"] as const;

export const WarehouseAccessLevelOptions = [
	"Viewer",
	"Picker",
	"Manager",
] as const satisfies readonly WarehouseAccessLevel[];

export const WarehouseAccessPermissionOptions = [
	"View Stock",
	"Receive Stock",
	"Issue Stock",
	"Transfer Stock",
	"Adjust Stock",
	"Manage Locations",
	"View History",
] as const satisfies readonly WarehouseAccessPermission[];
