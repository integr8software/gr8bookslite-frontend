export type PurchasingAccountingEntry = {
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

export type PurchasingAccountingColumnId =
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

export type PurchasingEntryTab = "accounting" | "details";
