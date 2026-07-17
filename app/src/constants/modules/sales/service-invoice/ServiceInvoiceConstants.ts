import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const ServiceInvoiceHref = getModuleRoute("SVI");

export const ServiceInvoiceStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Active", value: "Active" },
	{ label: "Pending", value: "Pending" },
	{ label: "Approved", value: "Approved" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Closed", value: "Closed" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const ServiceInvoiceStatusFilters = [
	"all",
	"Active",
	"Pending",
	"Approved",
	"Disapproved",
	"Closed",
	"Cancelled",
] as const;

export const ServiceInvoiceTablePaginationStorageKey = "sales-service-invoice";
