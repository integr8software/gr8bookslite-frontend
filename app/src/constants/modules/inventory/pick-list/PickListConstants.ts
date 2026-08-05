import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PickListHref = getModuleRoute("PL");

export const PickListStatuses = {
	cancelled: "Cancelled",
	disapproved: "Disapproved",
	draft: "Draft",
	forApproval: "For Approval",
	posted: "Posted",
} as const;

export const PickListStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: PickListStatuses.draft, value: PickListStatuses.draft },
	{ label: PickListStatuses.forApproval, value: PickListStatuses.forApproval },
	{ label: PickListStatuses.posted, value: PickListStatuses.posted },
	{ label: PickListStatuses.disapproved, value: PickListStatuses.disapproved },
	{ label: PickListStatuses.cancelled, value: PickListStatuses.cancelled },
] as const;

export const PickListStatusFilters = [
	"all",
	PickListStatuses.draft,
	PickListStatuses.forApproval,
	PickListStatuses.posted,
	PickListStatuses.disapproved,
	PickListStatuses.cancelled,
] as const;

export const PickListTablePaginationStorageKey = "inventory-pick-list";
