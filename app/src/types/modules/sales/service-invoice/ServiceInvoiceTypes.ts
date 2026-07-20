export type ServiceInvoiceActionMode = "add" | "edit" | "view";

export type ServiceInvoiceStatus =
	| "Active"
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

export type ServiceInvoiceRecord = {
	id: string;
	amount: number;
	customerCode: string;
	customerName: string;
	documentDate: string;
	formValues?: ServiceInvoiceFormValues;
	invoiceNo: string;
	referenceNo: string;
	status: ServiceInvoiceStatus;
	transactionNo: string;
};

export type ServiceInvoiceLineEntry = {
	id: string;
	description: string;
	particulars: string;
	amount: string;
	quantity: string;
	netAmount: string;
	vatAmount: string;
	wvatAmount: string;
	ewtAmount: string;
	discountPercent: string;
	discountAmount: string;
	grossAmount: string;
	vatType: string;
	vatable: string;
	vatInclusive: string;
	withWvat: string;
	wvatType: string;
	withEwt: string;
	ewtType: string;
	responsibilityCenter: string;
};

export type ServiceInvoiceFormValues = {
	code: string;
	name: string;
	currency: string;
	exchangeRate: string;
	contactPerson: string;
	remarks: string;
	terms: string;
	dueDate: string;
	description: string;
	defaultAccount: string;
	teamAssigned: string;
	startDate: string;
	expirationDate: string;
	netAmount: string;
	vatAmount: string;
	wvatAmount: string;
	ewtAmount: string;
	discountAmount: string;
	grossAmount: string;
	salesAssociate: string;
	residentCustomerCode: string;
	residentCustomerName: string;
	recoupment: string;
	donation: string;
	partnersClientCode: string;
	partnersClientName: string;
	transactionNo: string;
	documentDate: string;
	sjNo: string;
	joNo: string;
	poNo: string;
	invoiceNo: string;
	referenceNo: string;
	businessStyle: string;
	status: string;
	projectRef: string;
	projectName: string;
	lineEntries: ServiceInvoiceLineEntry[];
};

export type ServiceInvoiceTotals = {
	discountAmount: number;
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
	wvatAmount: number;
};
