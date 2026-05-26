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
};

export type MasterInvoiceTableColumnKey =
	| "invoiceNo"
	| "subscriberName"
	| "availedItem"
	| "transactionDate"
	| "paymentMethod"
	| "amount"
	| "status";
