export type MasterInvoiceStatus =
	| "Paid"
	| "Pending"
	| "Failed"
	| "Refunded";

export type MasterInvoicePaymentMethod =
	| "Card"
	| "GCash"
	| "Maya"
	| "Bank Transfer"
	| "Manual Payment";

export type MasterInvoiceTransactionType =
	| "Subscription"
	| "Add-On"
	| "Upgrade"
	| "Refund"
	| "Top-Up";

export type MasterInvoiceStatusFilter = "All" | MasterInvoiceStatus;
export type MasterInvoicePaymentMethodFilter =
	| "All"
	| MasterInvoicePaymentMethod;
export type MasterInvoiceTransactionTypeFilter =
	| "All"
	| MasterInvoiceTransactionType;


export type MasterInvoiceRecord = {
	amount: number;
	availedItem: string;
	billingPeriod: string;
	id: string;
	invoiceNo: string;
	ownerName: string;
	paymentMethod: MasterInvoicePaymentMethod;
	planId: string;
	planName: string;
	referenceNo: string;
	status: MasterInvoiceStatus;
	subscriberId: string;
	subscriberName: string;
	transactionDate: string;
	transactionType: MasterInvoiceTransactionType;
};

export type MasterInvoiceTableColumnKey =
	| "invoiceNo"
	| "subscriberName"
	| "transactionType"
	| "availedItem"
	| "transactionDate"
	| "paymentMethod"
	| "amount"
	| "status";

export type MasterInvoiceSubscriberTab =
	| "overview"
	| "transactions"
	| "payments"
	| "plan";

export type MasterInvoiceSubscriberSummary = {
	failedInvoices: number;
	lastTransactionAmount?: number;
	lastTransactionDate?: string;
	paidAmount: number;
	paidInvoices: number;
	pendingAmount: number;
	pendingInvoices: number;
	planName: string;
	recentInvoices: MasterInvoiceRecord[];
	refundedAmount: number;
	refundedInvoices: number;
	subscriberId: string;
	subscriberName: string;
	totalAmount: number;
	totalInvoices: number;
};


