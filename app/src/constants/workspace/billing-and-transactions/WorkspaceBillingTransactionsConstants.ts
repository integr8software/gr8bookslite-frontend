import type {
	WorkspaceBillingTransactionSection,
	WorkspaceBillingTransactionStatus,
	WorkspaceBillingTransactionTableColumnKey,
} from "@/app/src/types/workspace/billing-and-transactions/WorkspaceBillingTransactionsTypes";

export const WorkspaceBillingTransactionsHref =
	"/workspace/billing-and-transactions";

export const WorkspaceBillingTransactionsPaginationStorageKey =
	"workspace.billing-transactions";

export const WorkspaceBillingTransactionTabs = [
	{ id: "overview", label: "Overview" },
	{ id: "invoices", label: "Invoices" },
	{ id: "payments", label: "Payments" },
	{ id: "subscription", label: "Subscription" },
] as const satisfies readonly {
	id: WorkspaceBillingTransactionSection;
	label: string;
}[];

export const WorkspaceBillingTransactionStatusOptions = [
	"PAID",
	"OPEN",
	"PENDING",
	"FAILED",
	"CANCELED",
	"REFUNDED",
] as const satisfies readonly WorkspaceBillingTransactionStatus[];

export const WorkspaceBillingTransactionTableColumns: {
	className: string;
	key: WorkspaceBillingTransactionTableColumnKey;
	label: string;
}[] = [
	{ key: "invoiceNo", label: "Invoice No.", className: "w-[13rem]" },
	{ key: "date", label: "Date", className: "w-[11rem]" },
	{ key: "description", label: "Description", className: "w-[28rem]" },
	{ key: "category", label: "Category", className: "w-[13rem]" },
	{ key: "billingMode", label: "Billing Mode", className: "w-[12rem]" },
	{ key: "status", label: "Status", className: "w-[10rem]" },
	{ key: "amount", label: "Amount", className: "w-[11rem] text-right" },
];
