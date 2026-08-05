import type { PurchaseOrderStatus } from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

export const PurchaseOrderHref = "/purchasing/purchase-order";

export const PurchaseOrderStorageKey = "gr8books.purchaseOrders";

export const PurchaseOrderTablePaginationStorageKey =
	"purchasing.purchase-order";

export const PurchaseOrderTypeOptions = ["Goods", "Services", "Assets"] as const;

export const PurchaseOrderCurrencyOptions = ["PHP", "USD", "JPY", "EUR"] as const;

export const PurchaseOrderUomOptions = ["PC", "BOX", "LOT", "SET", "KG"] as const;

export const PurchaseOrderBooleanOptions = ["False", "True"] as const;

export const PurchaseOrderTermsOptions = [
	"",
	"COD",
	"Net 15",
	"Net 30",
	"Net 60",
] as const;

export const PurchaseOrderStatusOptions: PurchaseOrderStatus[] = [
	"Draft",
	"For Approval",
	"Posted",
	"Disapproved",
	"Cancelled",
];

export const PurchaseOrderFormPageCopy = {
	add: {
		title: "Add Purchase Order",
		description:
			"Complete supplier, amounts, references, and order entries before saving.",
	},
	edit: {
		title: "Edit Purchase Order",
		description:
			"Update supplier, amount, reference, and order entry details.",
	},
	view: {
		title: "View Purchase Order",
		description:
			"Review purchase order details, references, and ordered item lines.",
	},
} as const;
