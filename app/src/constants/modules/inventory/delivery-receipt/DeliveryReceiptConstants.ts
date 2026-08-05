import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const DeliveryReceiptHref = getModuleRoute("DR");

export const DeliveryReceiptStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Draft", value: "Draft" },
	{ label: "For Approval", value: "For Approval" },
	{ label: "Posted", value: "Posted" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const DeliveryReceiptStatusFilters = [
	"all",
	"Draft",
	"For Approval",
	"Posted",
	"Disapproved",
	"Cancelled",
] as const;

export const DeliveryReceiptTablePaginationStorageKey =
	"inventory-delivery-receipt";
