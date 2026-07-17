import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type {
	WarehouseBranchAvailability,
	WarehouseStatus,
	WarehouseTableColumnKey,
	WarehouseTableRecord,
} from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const WarehouseHref = MODULE_ROUTE_MAP.WM;

export const WarehouseTablePaginationStorageKey =
	"maintenance.warehouses";

export const WarehouseStatusOptions = [
	"Active",
	"Inactive",
] as const satisfies readonly WarehouseStatus[];

export const WarehouseBranchOptions = [
	"Main Branch",
	"North Branch",
	"South Branch",
	"Cebu Branch",
] as const;

export const WarehouseBranchAvailabilityOptions = [
	"Home Branch Only",
	"Selected Branches",
	"All Branches",
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
	{ key: "name", label: "Warehouse", className: "w-[18rem]" },
	{
		key: "availableBranchLabel",
		label: "Branch",
		className: "w-[14rem]",
	},
	{ key: "managerName", label: "Manager", className: "w-[14rem]" },
	{ key: "totalItems", label: "Total Items", className: "w-[10rem]" },
	{ key: "inventoryValue", label: "Inventory Value", className: "w-[12rem]" },
	{ key: "status", label: "Status", className: "w-[9rem] text-center" },
	{ id: "actions", label: "Actions", className: "w-[14rem] text-center" },
];

export const WarehouseExportColumns: ModuleTableExportColumn<WarehouseTableRecord>[] =
	WarehouseTableColumns.flatMap((column) =>
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
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}

export const WarehouseFormPageCopy = {
	add: {
		title: "Add Warehouse",
		description:
			"Create a warehouse location and assign its available branches and manager.",
	},
	edit: {
		title: "Edit Warehouse",
		description:
			"Update warehouse information used by inventory receiving and issuing workflows.",
	},
	view: {
		title: "Warehouse Management",
		description:
			"Review warehouse information, available branches, and access assignments.",
	},
} as const;

export function createWarehouseAccessHref(warehouseId: string) {
	return `${WarehouseHref}/view/${warehouseId}/access`;
}

export function createWarehouseItemsHref(warehouseId: string) {
	return `${WarehouseHref}/view/${warehouseId}/items`;
}
