import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const GoodsIssueHref = getModuleRoute("GI");

export const GoodsIssueStatuses = {
	cancelled: "Cancelled",
	disapproved: "Disapproved",
	draft: "Draft",
	forApproval: "For Approval",
	posted: "Posted",
} as const;

export const GoodsIssueStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: GoodsIssueStatuses.draft, value: GoodsIssueStatuses.draft },
	{ label: GoodsIssueStatuses.forApproval, value: GoodsIssueStatuses.forApproval },
	{ label: GoodsIssueStatuses.posted, value: GoodsIssueStatuses.posted },
	{ label: GoodsIssueStatuses.disapproved, value: GoodsIssueStatuses.disapproved },
	{ label: GoodsIssueStatuses.cancelled, value: GoodsIssueStatuses.cancelled },
] as const;

export const GoodsIssueStatusFilters = [
	"all",
	GoodsIssueStatuses.draft,
	GoodsIssueStatuses.forApproval,
	GoodsIssueStatuses.posted,
	GoodsIssueStatuses.disapproved,
	GoodsIssueStatuses.cancelled,
] as const;

export const GoodsIssueTablePaginationStorageKey = "inventory-goods-issue";
