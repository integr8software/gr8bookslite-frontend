import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PickListHref = getModuleRoute("PL");

export const PickListStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Draft", value: "Draft" },
	{ label: "For Approval", value: "For Approval" },
	{ label: "Posted", value: "Posted" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const PickListStatusFilters = [
	"all",
	"Draft",
	"For Approval",
	"Posted",
	"Disapproved",
	"Cancelled",
] as const;

export const PickListTablePaginationStorageKey = "inventory-pick-list";
