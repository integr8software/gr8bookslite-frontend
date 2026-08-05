import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const ServiceInvoiceHref = getModuleRoute("SVI");

export const ServiceInvoiceStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: "Draft", value: "Draft" },
	{ label: "For Approval", value: "For Approval" },
	{ label: "Posted", value: "Posted" },
	{ label: "Disapproved", value: "Disapproved" },
	{ label: "Cancelled", value: "Cancelled" },
] as const;

export const ServiceInvoiceStatusFilters = [
	"all",
	"Draft",
	"For Approval",
	"Posted",
	"Disapproved",
	"Cancelled",
] as const;

export const ServiceInvoiceTablePaginationStorageKey = "sales-service-invoice";
