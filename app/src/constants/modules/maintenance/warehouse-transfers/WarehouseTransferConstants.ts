import type { WarehouseTransferStatus } from "@/app/src/types/modules/maintenance/warehouse-transfers/WarehouseTransferTypes";

export const WarehouseTransfersHref = "/maintenance/warehouse-transfers";

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
	{ id: "status", label: "Status", valueIndex: 6, className: "w-[10rem]" },
	{ id: "actions", label: "Actions", className: "w-[9rem] text-center" },
] as const;

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
