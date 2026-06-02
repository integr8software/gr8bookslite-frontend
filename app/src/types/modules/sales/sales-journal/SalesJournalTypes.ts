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

export type SalesJournalRecord = {
	id: string;
	partyCode: string;
	partyName: string;
	remarks: string;
	documentDate: string;
	currency: string;
	exchangeRate: number;
	terms: string;
	dueDate: string;
	documentNo: string;
	status: SalesJournalStatus;
	lines: SalesJournalLine[];
	createdAt: string;
	updatedAt: string;
};

export type SalesJournalFormValues = Omit<
	SalesJournalRecord,
	"id" | "createdAt" | "updatedAt"
>;

export type SalesJournalLineField = keyof SalesJournalLine;

export type SalesJournalFormErrors = Partial<
	Record<keyof SalesJournalFormValues | "balance", string>
> & {
	lineErrors?: Record<string, Partial<Record<keyof SalesJournalLine, string>>>;
};

export type SalesJournalActionMode = "add" | "edit" | "view";
