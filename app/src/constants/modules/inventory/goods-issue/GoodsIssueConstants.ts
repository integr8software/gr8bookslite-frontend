import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const GoodsIssueHref = getModuleRoute("GI");

export const GoodsIssueStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const GoodsIssueStatusFilters = [
	"all",
	"Active",
	"Pending",
	"Approved",
	"Disapproved",
	"Closed",
	"Cancelled",
] as const;

export const GoodsIssueTablePaginationStorageKey = "inventory-goods-issue";
