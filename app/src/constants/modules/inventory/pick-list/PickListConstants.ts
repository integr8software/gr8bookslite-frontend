import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const PickListHref = getModuleRoute("PL");

export const PickListStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const PickListStatusFilters = [
	"all",
	"Active",
	"Pending",
	"Approved",
	"Disapproved",
	"Closed",
	"Cancelled",
] as const;

export const PickListTablePaginationStorageKey = "inventory-pick-list";
