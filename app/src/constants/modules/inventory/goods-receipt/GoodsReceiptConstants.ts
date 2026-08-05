import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const GoodsReceiptHref = getModuleRoute("GR");

export const GoodsReceiptStatuses = {
	cancelled: "Cancelled",
	disapproved: "Disapproved",
	draft: "Draft",
	forApproval: "For Approval",
	posted: "Posted",
} as const;

export const GoodsReceiptStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: GoodsReceiptStatuses.draft, value: GoodsReceiptStatuses.draft },
	{
		label: GoodsReceiptStatuses.forApproval,
		value: GoodsReceiptStatuses.forApproval,
	},
	{ label: GoodsReceiptStatuses.posted, value: GoodsReceiptStatuses.posted },
	{ label: GoodsReceiptStatuses.disapproved, value: GoodsReceiptStatuses.disapproved },
	{ label: GoodsReceiptStatuses.cancelled, value: GoodsReceiptStatuses.cancelled },
] as const;

export const GoodsReceiptStatusFilters = [
	"all",
	GoodsReceiptStatuses.draft,
	GoodsReceiptStatuses.forApproval,
	GoodsReceiptStatuses.posted,
	GoodsReceiptStatuses.disapproved,
	GoodsReceiptStatuses.cancelled,
] as const;

export const GoodsReceiptTablePaginationStorageKey = "inventory-goods-receipt";
