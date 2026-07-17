import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleRouteMap";

export const DeliveryReceiptHref = getModuleRoute("DR");

export const DeliveryReceiptStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const DeliveryReceiptStatusFilters = [
	"all",
	"Active",
	"Pending",
	"Approved",
	"Disapproved",
	"Closed",
	"Cancelled",
] as const;

export const DeliveryReceiptTablePaginationStorageKey =
	"inventory-delivery-receipt";
