import type { PurchaseRequestStatus } from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

export const PurchaseRequestHref = "/purchasing/purchase-request";

export const PurchaseRequestStorageKey = "gr8books.purchaseRequests";

export const PurchaseRequestTablePaginationStorageKey =
	"purchasing.purchase-request";

export const PurchaseRequestTypeOptions = ["Goods", "Services", "Assets"] as const;

export const PurchaseRequestStatusOptions: PurchaseRequestStatus[] = [
	"Draft",
	"For Approval",
	"Posted",
	"Disapproved",
	"Cancelled",
];

export const PurchaseRequestCurrencyOptions = ["PHP", "USD", "JPY", "EUR"] as const;

export const PurchaseRequestUomOptions = ["PC", "BOX", "LOT", "SET", "KG"] as const;

export const PurchaseRequestFormSignatoryModuleCodes = [
	"purchasing-purchase-request",
	"purchase-request",
	"purchasing",
] as const;

export const PurchaseRequestFormPageCopy = {
	add: {
		title: "New Purchase Request",
		description:
			"Capture supplier, project, currency, and item request details, then preview the printable purchase request.",
	},
	edit: {
		title: "Edit Purchase Request",
		description:
			"Update supplier, project, currency, item, and approval details for this request.",
	},
	view: {
		title: "Purchase Request",
		description:
			"Review request details and preview the printable purchase request.",
	},
} as const;
