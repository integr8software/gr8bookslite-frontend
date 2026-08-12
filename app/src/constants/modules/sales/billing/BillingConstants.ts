import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const BillingHref = getModuleRoute("B");

export const BillingStatuses = {
	cancelled: "Cancelled",
	disapproved: "Disapproved",
	draft: "Draft",
	forApproval: "For Approval",
	posted: "Posted",
} as const;

export const BillingStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: BillingStatuses.draft, value: BillingStatuses.draft },
	{
		label: BillingStatuses.forApproval,
		value: BillingStatuses.forApproval,
	},
	{ label: BillingStatuses.posted, value: BillingStatuses.posted },
	{
		label: BillingStatuses.disapproved,
		value: BillingStatuses.disapproved,
	},
	{ label: BillingStatuses.cancelled, value: BillingStatuses.cancelled },
] as const;

export const BillingStatusFilters = [
	"all",
	BillingStatuses.draft,
	BillingStatuses.forApproval,
	BillingStatuses.posted,
	BillingStatuses.disapproved,
	BillingStatuses.cancelled,
] as const;

export const BillingTablePaginationStorageKey = "sales-billing";
