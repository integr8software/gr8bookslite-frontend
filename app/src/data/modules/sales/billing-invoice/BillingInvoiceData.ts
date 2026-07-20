import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingInvoiceFormValues,
	BillingInvoiceLineEntry,
	BillingInvoiceRecord,
	BillingInvoiceStatus,
	BillingInvoiceTotals,
} from "@/app/src/types/modules/sales/billing-invoice/BillingInvoiceTypes";

export const BillingInvoiceStorageKey = "gr8books.billing-invoice.records";

export const BillingInvoiceCurrencyOptions = [
	{ name: "PHP", value: "PHP" },
	{ name: "USD", value: "USD" },
];

export const BillingInvoicePartyOptions = [
	{ name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
	{ name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
	{ name: "Bluecrest Trading", value: "Bluecrest Trading" },
	{ name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const BillingInvoiceTermOptions = [
	{ name: "--Select Terms--", value: "" },
	{ name: "Due on receipt", value: "Due on receipt" },
	{ name: "Net 15", value: "Net 15" },
	{ name: "Net 30", value: "Net 30" },
];

export const BillingInvoiceDescriptionOptions = [
	{ name: "--Select Description--", value: "" },
	{ name: "Professional services", value: "Professional services" },
	{ name: "Consulting services", value: "Consulting services" },
	{ name: "Maintenance services", value: "Maintenance services" },
];

export const BillingInvoiceDefaultAccountOptions = [
	{ name: "--Select Debit Account--", value: "" },
	{ name: "Accounts Receivable - Trade", value: "Accounts Receivable - Trade" },
	{ name: "Service Revenue", value: "Service Revenue" },
	{ name: "Unearned Revenue", value: "Unearned Revenue" },
];

export const BillingInvoiceTeamOptions = [
	{ name: "--Select Team--", value: "" },
	{ name: "Operations", value: "Operations" },
	{ name: "Sales", value: "Sales" },
	{ name: "Admin", value: "Admin" },
];

export const BillingInvoiceVatTypeOptions = [
	{ name: "VAT (12%)", value: "VAT (12%)" },
	{ name: "Zero-rated", value: "Zero-rated" },
	{ name: "VAT Exempt", value: "VAT Exempt" },
];

export const BillingInvoiceBooleanOptions = [
	{ name: "True", value: "True" },
	{ name: "False", value: "False" },
];

export const BillingInvoiceTaxTypeOptions = [
	{ name: "0.00", value: "0.00" },
	{ name: "1.00", value: "1.00" },
	{ name: "2.00", value: "2.00" },
	{ name: "5.00", value: "5.00" },
];

export const BillingInvoiceResponsibilityCenterOptions = [
	{ name: "CC-ADM-001", value: "CC-ADM-001" },
	{ name: "CC-SLS-001", value: "CC-SLS-001" },
	{ name: "CC-OPS-001", value: "CC-OPS-001" },
];

export const MockBillingInvoices: BillingInvoiceRecord[] = [
	{
		id: "bi-001",
		amount: 18450,
		customerCode: "CUST-001",
		customerName: "North Harbor Office Depot",
		documentDate: "2026-07-15",
		invoiceNo: "BI-2026-0001",
		referenceNo: "PO-2026-0192",
		status: "Active",
		transactionNo: "BI-2026-0001",
	},
	{
		id: "bi-002",
		amount: 62500,
		customerCode: "CUST-002",
		customerName: "Aster Foods Corporation",
		documentDate: "2026-07-11",
		invoiceNo: "BI-2026-0002",
		referenceNo: "JO-2026-0048",
		status: "Pending",
		transactionNo: "BI-2026-0002",
	},
	{
		id: "bi-003",
		amount: 93800,
		customerCode: "CUST-003",
		customerName: "Harborview Logistics",
		documentDate: "2026-07-08",
		invoiceNo: "BI-2026-0003",
		referenceNo: "SO-2026-0105",
		status: "Approved",
		transactionNo: "BI-2026-0003",
	},
];

export function createBlankBillingInvoiceLineEntry(
	overrides: Partial<BillingInvoiceLineEntry> = {},
): BillingInvoiceLineEntry {
	return {
		id: `bi-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		description: "",
		particulars: "",
		amount: "0.00",
		quantity: "0.00",
		netAmount: "0.00",
		vatAmount: "0.00",
		wvatAmount: "0.00",
		ewtAmount: "0.00",
		discountPercent: "",
		discountAmount: "0.00",
		grossAmount: "0.00",
		vatType: "VAT (12%)",
		vatable: "True",
		vatInclusive: "False",
		withWvat: "False",
		wvatType: "0.00",
		withEwt: "False",
		ewtType: "0.00",
		responsibilityCenter: "",
		...overrides,
	};
}

export function createBillingInvoiceFormValues(): BillingInvoiceFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		code: "",
		name: "",
		currency: "PHP",
		exchangeRate: "1.0000",
		contactPerson: "",
		remarks: "",
		terms: "",
		dueDate: today,
		description: "",
		defaultAccount: "",
		teamAssigned: "",
		startDate: today,
		expirationDate: today,
		chargeWeight: "",
		actualWeight: "",
		cargoDescription: "",
		noPackages: "",
		noContainers: "",
		destinationPort: "",
		clearancePort: "",
		netAmount: "0.00",
		vatAmount: "0.00",
		wvatAmount: "0.00",
		ewtAmount: "0.00",
		discountAmount: "0.00",
		grossAmount: "0.00",
		salesAssociate: "",
		residentCustomerCode: "",
		residentCustomerName: "",
		recoupment: "0.00",
		donation: "0.00",
		partnersClientCode: "",
		partnersClientName: "",
		transactionNo: "BI-2026-0004",
		documentDate: today,
		sjNo: "",
		joNo: "",
		poNo: "",
		invoiceNo: "",
		referenceNo: "",
		businessStyle: "",
		status: "Draft",
		projectRef: "",
		projectName: "",
		ourReference: "",
		clientReference: "",
		entryDate: "",
		shipperConsignee: "",
		entryNumber: "",
		mawbNo: "",
		blHawbNo: "",
		carrierFlight: "",
		etsEtd: "",
		eta: "",
		originPort: "",
		lineEntries: [createBlankBillingInvoiceLineEntry()],
	};
}

export function createBillingInvoiceFormValuesFromRecord(
	record: BillingInvoiceRecord,
): BillingInvoiceFormValues {
	if (record.formValues) {
		return {
			...record.formValues,
			lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
		};
	}

	return {
		...createBillingInvoiceFormValues(),
		code: record.customerCode,
		name: record.customerName,
		documentDate: record.documentDate,
		grossAmount: record.amount.toFixed(2),
		invoiceNo: record.invoiceNo,
		netAmount: record.amount.toFixed(2),
		referenceNo: record.referenceNo,
		status: record.status,
		transactionNo: record.transactionNo,
		lineEntries: [
			createBlankBillingInvoiceLineEntry({
				description: "Professional services",
				grossAmount: record.amount.toFixed(2),
				netAmount: record.amount.toFixed(2),
				particulars: record.referenceNo,
			}),
		],
	};
}

export function createBillingInvoiceRecordFromForm(
	values: BillingInvoiceFormValues,
	existingRecord?: BillingInvoiceRecord,
): BillingInvoiceRecord {
	const totals = calculateBillingInvoiceTotals(values.lineEntries);
	const amount = totals.grossAmount || parseMoneyNumberInput(values.grossAmount);

	return {
		id: existingRecord?.id ?? `bi-${Date.now()}`,
		amount,
		customerCode: values.code,
		customerName: values.name,
		documentDate: values.documentDate,
		formValues: {
			...values,
			lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
		},
		invoiceNo: values.invoiceNo || values.transactionNo,
		referenceNo: values.referenceNo || values.poNo || values.joNo,
		status: normalizeBillingInvoiceStatus(values.status),
		transactionNo: values.transactionNo,
	};
}

export function calculateBillingInvoiceTotals(
	entries: BillingInvoiceLineEntry[],
): BillingInvoiceTotals {
	return entries.reduce(
		(summary, entry) => ({
			discountAmount:
				summary.discountAmount + parseMoneyNumberInput(entry.discountAmount),
			ewtAmount: summary.ewtAmount + parseMoneyNumberInput(entry.ewtAmount),
			grossAmount:
				summary.grossAmount + parseMoneyNumberInput(entry.grossAmount),
			netAmount: summary.netAmount + parseMoneyNumberInput(entry.netAmount),
			vatAmount: summary.vatAmount + parseMoneyNumberInput(entry.vatAmount),
			wvatAmount: summary.wvatAmount + parseMoneyNumberInput(entry.wvatAmount),
		}),
		{
			discountAmount: 0,
			ewtAmount: 0,
			grossAmount: 0,
			netAmount: 0,
			vatAmount: 0,
			wvatAmount: 0,
		},
	);
}

export function getInitialBillingInvoices() {
	return readStoredBillingInvoices() ?? MockBillingInvoices;
}

export function readStoredBillingInvoices() {
	if (typeof window === "undefined") {
		return null;
	}

	const storedRecords = window.localStorage.getItem(BillingInvoiceStorageKey);

	if (!storedRecords) {
		return null;
	}

	try {
		const parsedRecords = JSON.parse(storedRecords) as BillingInvoiceRecord[];

		return Array.isArray(parsedRecords) ? parsedRecords : null;
	} catch {
		return null;
	}
}

export function writeStoredBillingInvoices(records: BillingInvoiceRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(BillingInvoiceStorageKey, JSON.stringify(records));
}

export function formatBillingInvoiceAmount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatBillingInvoiceCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(amount);
}

export function formatBillingInvoiceDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function countBillingInvoicesByStatus(
	records: BillingInvoiceRecord[],
	status: BillingInvoiceStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function isBillingInvoiceActiveStatus(status: BillingInvoiceStatus) {
	return status === "Active" || status === "Approved";
}

export function formatBillingInvoicePercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function billingInvoiceEntryHasData(entry: BillingInvoiceLineEntry) {
	return (
		entry.description.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}

export function billingInvoiceEntryIsComplete(entry: BillingInvoiceLineEntry) {
	return (
		entry.description.trim() !== "" &&
		(parseMoneyNumberInput(entry.netAmount) > 0 ||
			parseMoneyNumberInput(entry.grossAmount) > 0)
	);
}

function normalizeBillingInvoiceStatus(value: string): BillingInvoiceStatus {
	const statuses: BillingInvoiceStatus[] = [
		"Active",
		"Approved",
		"Cancelled",
		"Closed",
		"Disapproved",
		"Draft",
		"Pending",
	];

	return statuses.includes(value as BillingInvoiceStatus)
		? (value as BillingInvoiceStatus)
		: "Draft";
}

