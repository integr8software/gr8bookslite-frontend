import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const GoodsReceiptHref = getModuleRoute("GR");

export const GoodsReceiptStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Draft", value: "Draft" },
	{ label: "Active", value: "Active" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const GoodsReceiptStatusFilters = [
	"all",
	"Draft",
	"Active",
	"Pending",
	"Approved",
	"Disapproved",
	"Closed",
	"Cancelled",
] as const;

export const GoodsReceiptTablePaginationStorageKey = "inventory-goods-receipt";
