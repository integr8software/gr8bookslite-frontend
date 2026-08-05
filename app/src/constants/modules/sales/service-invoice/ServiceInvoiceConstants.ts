import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const ServiceInvoiceHref = getModuleRoute("SVI");

export const ServiceInvoiceStatuses = {
	cancelled: "Cancelled",
	disapproved: "Disapproved",
	draft: "Draft",
	forApproval: "For Approval",
	posted: "Posted",
} as const;

export const ServiceInvoiceStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: ServiceInvoiceStatuses.draft, value: ServiceInvoiceStatuses.draft },
	{
		label: ServiceInvoiceStatuses.forApproval,
		value: ServiceInvoiceStatuses.forApproval,
	},
	{ label: ServiceInvoiceStatuses.posted, value: ServiceInvoiceStatuses.posted },
	{
		label: ServiceInvoiceStatuses.disapproved,
		value: ServiceInvoiceStatuses.disapproved,
	},
	{ label: ServiceInvoiceStatuses.cancelled, value: ServiceInvoiceStatuses.cancelled },
] as const;

export const ServiceInvoiceStatusFilters = [
	"all",
	ServiceInvoiceStatuses.draft,
	ServiceInvoiceStatuses.forApproval,
	ServiceInvoiceStatuses.posted,
	ServiceInvoiceStatuses.disapproved,
	ServiceInvoiceStatuses.cancelled,
] as const;

export const ServiceInvoiceTablePaginationStorageKey = "sales-service-invoice";
