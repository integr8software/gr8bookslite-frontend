export type BillingActionMode = "add" | "edit" | "view";

export type BillingStatus =
	| "Cancelled"
	| "Disapproved"
	| "Draft"
	| "For Approval"
	| "Posted";

export type BillingAccountingColumnId =
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

export type BillingEntryTab = "accounting" | "service";

export type BillingRecord = {
	id: string;
	amount: number;
	customerCode: string;
	customerName: string;
	documentDate: string;
	formValues?: BillingFormValues;
	invoiceNo: string;
	referenceNo: string;
	status: BillingStatus;
	transactionNo: string;
};

export type BillingLineEntry = {
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

export type BillingAccountingEntry = {
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

export type BillingFormValues = {
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
	lineEntries: BillingLineEntry[];
	accountingEntries: BillingAccountingEntry[];
};

export type BillingTotals = {
	discountAmount: number;
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
	wvatAmount: number;
};
