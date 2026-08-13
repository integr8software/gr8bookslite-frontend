import { getModuleRoute } from "@/app/src/data/shared/modules/ModuleCatalogData";

export const DeliveryReceiptHref = getModuleRoute("DR");

export const DeliveryReceiptStatuses = {
	cancelled: "Cancelled",
	disapproved: "Disapproved",
	draft: "Draft",
	forApproval: "For Approval",
	posted: "Posted",
} as const;

export const DeliveryReceiptStatusFilterOptions = [
	{ label: "All statuses", value: "all" },
	{ label: DeliveryReceiptStatuses.draft, value: DeliveryReceiptStatuses.draft },
	{
		label: DeliveryReceiptStatuses.forApproval,
		value: DeliveryReceiptStatuses.forApproval,
	},
	{ label: DeliveryReceiptStatuses.posted, value: DeliveryReceiptStatuses.posted },
	{
		label: DeliveryReceiptStatuses.disapproved,
		value: DeliveryReceiptStatuses.disapproved,
	},
	{
		label: DeliveryReceiptStatuses.cancelled,
		value: DeliveryReceiptStatuses.cancelled,
	},
] as const;

export const DeliveryReceiptStatusFilters = [
	"all",
	DeliveryReceiptStatuses.draft,
	DeliveryReceiptStatuses.forApproval,
	DeliveryReceiptStatuses.posted,
	DeliveryReceiptStatuses.disapproved,
	DeliveryReceiptStatuses.cancelled,
] as const;

export const DeliveryReceiptTablePaginationStorageKey =
	"inventory-delivery-receipt";
