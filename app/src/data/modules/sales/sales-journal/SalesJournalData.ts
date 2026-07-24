import type {
	SalesJournalFormValues,
	SalesJournalItemEntry,
	SalesJournalLine,
	SalesJournalRecord,
} from "@/app/src/types/modules/sales/sales-journal/SalesJournalTypes";

export const SalesJournalInitialFormValues: SalesJournalFormValues = {
	address: "",
	contactNo: "",
	contactPerson: "",
	partyCode: "",
	partyName: "",
	poNo: "",
	projectName: "",
	remarks: "",
	resCenter: "",
	documentDate: new Date().toISOString().slice(0, 10),
	currency: "PHP",
	exchangeRate: 1,
	terms: "",
	dueDate: "",
	documentNo: "",
	salesPersonnel: "",
	siNo: "",
	soNo: "",
	status: "Draft",
	itemEntries: [createSalesJournalItemEntry()],
	lines: [createSalesJournalLine(1), createSalesJournalLine(2)],
};

export const MockSalesJournals: SalesJournalRecord[] = [
	{
		id: "sj-1",
		address: "",
		contactNo: "",
		contactPerson: "",
		partyCode: "CUS-1001",
		partyName: "North Harbor Trading",
		poNo: "",
		projectName: "",
		remarks: "Monthly billing accrual",
		resCenter: "",
		documentDate: "2026-05-30",
		currency: "PHP",
		exchangeRate: 1,
		terms: "Net 30",
		dueDate: "2026-06-29",
		documentNo: "SJ-2026-0001",
		salesPersonnel: "",
		siNo: "SI-2026-0420",
		soNo: "",
		status: "Draft",
		itemEntries: [
			createSalesJournalItemEntry({
				professionalServiceType: "Professional services",
				rate: "10,000.00",
				quantity: "1",
				amount: "10,000.00",
				vatAmount: "1,200.00",
				discountAmount: "0.00",
				netAmount: "11,200.00",
			}),
		],
		lines: [
			{
				...createSalesJournalLine(1),
				id: "sj-1-line-1",
				accountCode: "1100",
				accountTitle: "Accounts Receivable",
				debit: 11200,
				partyCode: "CUS-1001",
				partyName: "North Harbor Trading",
				refNo: "SI-2026-0420",
				vatType: "VATable",
			},
			{
				...createSalesJournalLine(2),
				id: "sj-1-line-2",
				accountCode: "4100",
				accountTitle: "Sales Revenue",
				credit: 10000,
				refNo: "SI-2026-0420",
				vatType: "VATable",
			},
			{
				...createSalesJournalLine(3),
				id: "sj-1-line-3",
				accountCode: "2200",
				accountTitle: "Output VAT Payable",
				credit: 1200,
				refNo: "SI-2026-0420",
				vatType: "VATable",
			},
		],
		createdAt: "2026-05-30T00:00:00.000Z",
		updatedAt: "2026-05-30T00:00:00.000Z",
	},
];

export function createSalesJournalItemEntry(
	overrides: Partial<SalesJournalItemEntry> = {},
): SalesJournalItemEntry {
	return {
		id: `sj-item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
		professionalServiceType: "",
		rate: "0.00",
		quantity: "0.00",
		amount: "0.00",
		vatAmount: "0.00",
		discountAmount: "0.00",
		netAmount: "0.00",
		...overrides,
	};
}

export function createSalesJournalLine(lineNumber: number): SalesJournalLine {
	return {
		id: `sj-line-${Date.now()}-${lineNumber}-${Math.random()
			.toString(36)
			.slice(2, 7)}`,
		lineNumber,
		accountCode: "",
		accountTitle: "",
		debit: 0,
		credit: 0,
		particulars: "",
		partyCode: "",
		partyName: "",
		responsibilityCenter: "",
		refNo: "",
		vatType: "VATable",
		atcCode: "",
	};
}

export function renumberSalesJournalLines(lines: SalesJournalLine[]) {
	return lines.map((line, index) => ({
		...line,
		lineNumber: index + 1,
	}));
}

export function createSalesJournalFormValues(
	record: SalesJournalRecord,
): SalesJournalFormValues {
	return {
		address: record.address ?? "",
		contactNo: record.contactNo ?? "",
		contactPerson: record.contactPerson ?? "",
		partyCode: record.partyCode,
		partyName: record.partyName,
		poNo: record.poNo ?? "",
		projectName: record.projectName ?? "",
		remarks: record.remarks,
		resCenter: record.resCenter ?? "",
		documentDate: record.documentDate,
		currency: record.currency,
		exchangeRate: record.exchangeRate,
		terms: record.terms,
		dueDate: record.dueDate,
		documentNo: record.documentNo,
		salesPersonnel: record.salesPersonnel ?? "",
		siNo: record.siNo ?? "",
		soNo: record.soNo ?? "",
		status: record.status,
		itemEntries:
			record.itemEntries?.map((entry) => ({
				...createSalesJournalItemEntry(),
				...entry,
			})) ?? [createSalesJournalItemEntry()],
		lines: record.lines.map((line) => ({ ...line })),
	};
}

export function createSalesJournalFromForm(
	values: SalesJournalFormValues,
): SalesJournalRecord {
	const now = new Date().toISOString();

	return {
		id: `sj-${Date.now()}`,
		...values,
		lines: renumberSalesJournalLines(values.lines),
		createdAt: now,
		updatedAt: now,
	};
}

export function updateSalesJournalFromForm(
	record: SalesJournalRecord,
	values: SalesJournalFormValues,
): SalesJournalRecord {
	return {
		...record,
		...values,
		lines: renumberSalesJournalLines(values.lines),
		updatedAt: new Date().toISOString(),
	};
}

export function getSalesJournalTotals(lines: SalesJournalLine[]) {
	const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
	const totalCredit = lines.reduce(
		(sum, line) => sum + Number(line.credit || 0),
		0,
	);
	const variance = totalDebit - totalCredit;

	return {
		totalCredit,
		totalDebit,
		variance,
		isBalanced: lines.length > 0 && Math.abs(variance) < 0.001,
	};
}

export function formatSalesJournalAmount(value: number) {
	return new Intl.NumberFormat("en-PH", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(value);
}
