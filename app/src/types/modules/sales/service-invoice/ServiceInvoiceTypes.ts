export type ServiceInvoiceActionMode = "add" | "edit" | "view";

export type ServiceInvoiceStatus =
	| "Cancelled"
	| "Disapproved"
	| "Draft"
	| "For Approval"
	| "Posted";

export type ServiceInvoiceAccountingColumnId =
	| "accountCode"
	| "accountTitle"
	| "atcCode"
	| "credit"
	| "debit"
	| "partyCode"
	| "partyName"
	| "particulars"
	| "refNo"
	| "responsibilityCenter"
	| "vatType";

export type ServiceInvoiceEntryTab = "accounting" | "service";

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

export type ServiceInvoiceAccountingEntry = {
	id: string;
	accountCode: string;
	accountTitle: string;
	debit: number;
	credit: number;
	partyCode: string;
	partyName: string;
	particulars: string;
	vatType: string;
	atcCode: string;
	responsibilityCenter: string;
	refNo: string;
};

export type ServiceInvoiceFormValues = {
	address: string;
	billToName: string;
	code: string;
	name: string;
	currency: string;
	exchangeRate: string;
	contactPerson: string;
	contactNo: string;
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
	projectCode: string;
	projectName: string;
	soNo: string;
	lineEntries: ServiceInvoiceLineEntry[];
	accountingEntries: ServiceInvoiceAccountingEntry[];
};

export type ServiceInvoiceTotals = {
	discountAmount: number;
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
	wvatAmount: number;
};
