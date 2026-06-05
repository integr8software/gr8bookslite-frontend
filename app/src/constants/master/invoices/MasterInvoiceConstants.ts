import type {
	MasterInvoicePaymentMethod,
	MasterInvoiceStatus,
	MasterInvoiceTableColumnKey,
} from "@/app/src/types/master/invoices/MasterInvoiceTypes";

export const MasterInvoicesHref = "/master/invoices";

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

export const MasterInvoiceTableColumns = [
	{ key: "invoiceNo", label: "Invoice", className: "w-[13rem]" },
	{ key: "subscriberName", label: "Subscriber", className: "w-[19rem]" },
	{ key: "availedItem", label: "Availed", className: "w-[21rem]" },
	{ key: "transactionDate", label: "Date", className: "w-[11rem]" },
	{ key: "paymentMethod", label: "Payment", className: "w-[12rem]" },
	{ key: "amount", label: "Amount", className: "w-[10rem]" },
	{ key: "status", label: "Status", className: "w-[9rem]" },
] as const satisfies readonly {
	key: MasterInvoiceTableColumnKey;
	label: string;
	className: string;
}[];
