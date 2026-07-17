import { MODULE_ROUTE_MAP } from "@/app/src/data/shared/modules/ModuleCatalogData";
import type { WarehouseTransferStatus } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import type { ModuleTableExportColumn } from "@/app/src/ui/shared/module/module-table/ModuleTableExportButton";

export const WarehouseTransfersHref = MODULE_ROUTE_MAP.WT;

export const WarehouseTransfersApiPath = "/maintenance/warehouse-transfers";

export const WarehouseTransfersTitle = "Warehouse Transfers";

export const WarehouseTransfersDescription =
	"Track warehouse transfers from draft through submitted, approved, in transit, received, and completed.";

export const WarehouseTransfersActionLabel = "Add Transfer";

export const WarehouseTransfersTableHeaders = [
	"Date",
	"Transfer Number",
	"Source Warehouse",
	"Destination Warehouse",
	"Requested By",
	"Approved By",
	"Status",
] as const;

export const WarehouseTransfersTableColumns = [
	{ id: "date", label: "Date", valueIndex: 0, className: "w-[10rem]" },
	{
		id: "referenceNumber",
		label: "Transfer Number",
		valueIndex: 1,
		className: "w-[12rem]",
	},
	{
		id: "sourceWarehouse",
		label: "Source Warehouse",
		valueIndex: 2,
		className: "w-[15rem]",
	},
	{
		id: "destinationWarehouse",
		label: "Destination Warehouse",
		valueIndex: 3,
		className: "w-[16rem]",
	},
	{
		id: "requestedBy",
		label: "Requested By",
		valueIndex: 4,
		className: "w-[13rem]",
	},
	{
		id: "approvedBy",
		label: "Approved By",
		valueIndex: 5,
		className: "w-[13rem]",
	},
	{
		id: "status",
		label: "Status",
		valueIndex: 6,
		className: "w-[10rem] text-center",
	},
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

export const WarehouseTransfersExportColumns: ModuleTableExportColumn<WarehouseModuleRecord>[] =
	WarehouseTransfersTableColumns.flatMap((column) =>
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

export function getWarehouseTransfersTableMinWidthClassName(
	visibleColumnCount: number,
) {
	if (visibleColumnCount >= 10) return "min-w-[136rem]";
	if (visibleColumnCount === 9) return "min-w-[122rem]";
	if (visibleColumnCount === 8) return "min-w-[108rem]";
	if (visibleColumnCount === 7) return "min-w-[94rem]";
	if (visibleColumnCount === 6) return "min-w-[80rem]";
	return "min-w-[64rem]";
}

export const WarehouseTransfersPaginationStorageKey =
	"maintenance.warehouse-transfers";

export const WarehouseTransferStatusOptions = [
	"Draft",
	"Submitted",
	"Approved",
	"In Transit",
	"Received",
	"Completed",
] as const satisfies readonly WarehouseTransferStatus[];
