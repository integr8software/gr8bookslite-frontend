export type BillingInvoiceActionMode = "add" | "edit" | "view";

export type BillingInvoiceStatus =
	| "Active"
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

export type BillingInvoiceRecord = {
	id: string;
	amount: number;
	customerCode: string;
	customerName: string;
	documentDate: string;
	formValues?: BillingInvoiceFormValues;
	invoiceNo: string;
	referenceNo: string;
	status: BillingInvoiceStatus;
	transactionNo: string;
};

export type BillingInvoiceLineEntry = {
	id: string;
	itemNo: string;
	itemName: string;
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

export type BillingInvoiceAccountEntry = {
	id: string;
	accountCode: string;
	accountTitle: string;
	debit: string;
	credit: string;
};

export type BillingInvoiceFormValues = {
	accountEntries: BillingInvoiceAccountEntry[];
	code: string;
	name: string;
	address: string;
	billToCode: string;
	billToName: string;
	currency: string;
	exchangeRate: string;
	contactNo: string;
	contactPerson: string;
	remarks: string;
	terms: string;
	dueDate: string;
	drNo: string;
	resCenter: string;
	description: string;
	defaultAccount: string;
	teamAssigned: string;
	startDate: string;
	expirationDate: string;
	chargeWeight: string;
	actualWeight: string;
	cargoDescription: string;
	noPackages: string;
	noContainers: string;
	destinationPort: string;
	clearancePort: string;
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
	ourReference: string;
	clientReference: string;
	entryDate: string;
	shipperConsignee: string;
	entryNumber: string;
	mawbNo: string;
	blHawbNo: string;
	carrierFlight: string;
	etsEtd: string;
	eta: string;
	originPort: string;
	lineEntries: BillingInvoiceLineEntry[];
};

export type BillingInvoiceTotals = {
	discountAmount: number;
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
	wvatAmount: number;
};

