import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceStatus,
	MasterInvoiceTableColumnKey,
	MasterInvoiceTransactionType,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";

export const MasterInvoicesHref = "/master/invoices";

export function getMasterInvoiceSubscriberHref(subscriberId: string) {
	return `${MasterInvoicesHref}/${subscriberId}`;
}


export const MasterInvoicePaginationStorageKey = "master-invoices";

export const MasterInvoiceStatusOptions = [
	"All",
	"Paid",
	"Pending",
	"Failed",
	"Refunded",
] as const satisfies readonly ("All" | MasterInvoiceStatus)[];

export const MasterInvoicePaymentMethodOptions = [
	"All",
	"Card",
	"GCash",
	"Maya",
	"Bank Transfer",
	"Manual Payment",
] as const satisfies readonly (
	| "All"
	| MasterInvoicePaymentMethod
)[];

export const MasterInvoiceTransactionTypeOptions = [
	"All",
	"Subscription",
	"Add-On",
	"Upgrade",
	"Refund",
	"Top-Up",
] as const satisfies readonly ("All" | MasterInvoiceTransactionType)[];

export const MasterInvoiceTableColumns = [
	{ key: "invoiceNo", label: "Transaction", className: "w-[13rem]" },
	{ key: "subscriberName", label: "Subscriber", className: "w-[17rem]" },
	{ key: "transactionType", label: "Type", className: "w-[11rem]" },
	{ key: "availedItem", label: "Description", className: "w-[20rem]" },
	{ key: "transactionDate", label: "Date", className: "w-[11rem]" },
	{ key: "paymentMethod", label: "Payment", className: "w-[12rem]" },
	{ key: "amount", label: "Amount", className: "w-[10rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
] as const satisfies readonly {
	key: MasterInvoiceTableColumnKey;
	label: string;
	className: string;
}[];

export const MasterInvoiceCompanyPaginationStorageKey =
	"master-invoice-companies";

export const MasterInvoiceCompanyTableColumns = [
	{ key: "subscriber", label: "Company / Subscriber", className: "w-[18rem]" },
	{ key: "plan", label: "Plan & Billing", className: "w-[14rem]" },
	{ key: "usage", label: "Usage & Scale", className: "w-[13rem]" },
	{ key: "transactions", label: "Transactions & Revenue", className: "w-[16rem]" },
	{ key: "status", label: "Status & Renewal", className: "w-[13rem]" },
	{ label: "Actions", className: "w-[12rem] text-right" },
] as const;



