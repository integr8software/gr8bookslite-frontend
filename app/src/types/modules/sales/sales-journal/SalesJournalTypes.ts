export type SalesJournalStatus = 
	| "Draft"
	| "Open"
	| "Approved"
	| "Closed"
	| "Cancelled";

export type SalesJournalLine = {
	id: string;
	lineNumber: number;
	accountCode: string;
	accountTitle: string;
	debit: number;
	credit: number;
	particulars: string;
	partyCode: string;
	partyName: string;
	responsibilityCenter: string;
	refNo: string;
	vatType: string;
	atcCode: string;
};

export type SalesJournalItemEntry = {
	id: string;
	professionalServiceType: string;
	rate: string;
	quantity: string;
	amount: string;
	vatAmount: string;
	discountAmount: string;
	netAmount: string;
};

export type SalesJournalRecord = {
	id: string;
	address: string;
	contactNo: string;
	contactPerson: string;
	partyCode: string;
	partyName: string;
	poNo: string;
	projectName: string;
	remarks: string;
	resCenter: string;
	documentDate: string;
	currency: string;
	exchangeRate: number;
	terms: string;
	dueDate: string;
	documentNo: string;
	salesPersonnel: string;
	siNo: string;
	soNo: string;
	status: SalesJournalStatus;
	itemEntries: SalesJournalItemEntry[];
	lines: SalesJournalLine[];
	createdAt: string;
	updatedAt: string;
};

export type SalesJournalFormValues = Omit<
	SalesJournalRecord,
	"id" | "createdAt" | "updatedAt"
>;

export type SalesJournalLineField = keyof SalesJournalLine;
export type SalesJournalItemEntryField = keyof SalesJournalItemEntry;

export type SalesJournalFormErrors = Partial<
	Record<keyof SalesJournalFormValues | "balance", string>
> & {
	lineErrors?: Record<string, Partial<Record<keyof SalesJournalLine, string>>>;
};

export type SalesJournalActionMode = "add" | "edit" | "view";
