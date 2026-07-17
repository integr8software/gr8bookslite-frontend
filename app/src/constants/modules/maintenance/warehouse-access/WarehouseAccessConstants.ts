import type {
	WarehouseAccessLevel,
	WarehouseAccessPermission,
} from "@/app/src/types/modules/maintenance/warehouse-access/WarehouseAccessTypes";

export const WarehouseAccessHref = "/maintenance/warehouse-access";

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
	{ id: "status", label: "Status", valueIndex: 3, className: "w-[10rem]" },
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

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
