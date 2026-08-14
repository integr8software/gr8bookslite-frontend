import type { BillingMode } from "@/app/src/data/billing/BillingTypes";

export type WorkspaceBillingTransactionSection =
	| "overview"
	| "invoices"
	| "payments"
	| "subscription";

export type WorkspaceBillingTransactionStatus =
	| "PAID"
	| "OPEN"
	| "PENDING"
	| "FAILED"
	| "CANCELED"
	| "REFUNDED";

export type WorkspaceBillingTransactionCategory =
	| "PLAN_CHARGE"
	| "RENEWAL"
	| "ADDITIONAL_COMPANY"
	| "ADDITIONAL_USER"
	| "ADD_ON"
	| "PAYMENT"
	| "REFUND";

export type WorkspaceBillingTransactionRecord = {
	amount: number;
	billingMode: BillingMode;
	billingPeriodEnd: string | null;
	billingPeriodStart: string | null;
	category: WorkspaceBillingTransactionCategory;
	companyName: string;
	currencyCode: string;
	date: string;
	description: string;
	id: string;
	invoiceNo: string;
	issuedDate: string;
	paidDate: string | null;
	paymentMethod: string | null;
	providerName: string | null;
	providerReference: string | null;
	status: WorkspaceBillingTransactionStatus;
};

export type WorkspaceBillingSubscriptionSnapshot = {
	billingMode: BillingMode;
	currentPlan: string;
	nextBillingDate: string;
	renewalDate: string;
	status: "ACTIVE" | "TRIALING" | "PAST_DUE";
};

export type WorkspaceBillingTransactionsSummary = {
	billingMode: BillingMode;
	currentPlan: string;
	nextBillingDate: string;
	outstandingBalance: number;
	totalBilled: number;
	totalPaid: number;
};

export type WorkspaceBillingTransactionsFilters = {
	billingMode: BillingMode | "all";
	query: string;
	section: WorkspaceBillingTransactionSection;
	status: WorkspaceBillingTransactionStatus | "all";
};

export type WorkspaceBillingTransactionTableColumnKey =
	| "invoiceNo"
	| "date"
	| "description"
	| "category"
	| "billingMode"
	| "status"
	| "amount";

export type WorkspaceBillingTransactionsPayload = {
	records: WorkspaceBillingTransactionRecord[];
	subscription: WorkspaceBillingSubscriptionSnapshot;
};
