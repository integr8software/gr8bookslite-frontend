import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	ServiceInvoiceFormValues,
	ServiceInvoiceLineEntry,
	ServiceInvoiceRecord,
	ServiceInvoiceStatus,
	ServiceInvoiceTotals,
} from "@/app/src/types/modules/sales/service-invoice/ServiceInvoiceTypes";

export const ServiceInvoiceStorageKey = "gr8books.service-invoice.records";

export const ServiceInvoiceCurrencyOptions = [
	{ name: "PHP", value: "PHP" },
	{ name: "USD", value: "USD" },
];

export const ServiceInvoicePartyOptions = [
	{ name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
	{ name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
	{ name: "Bluecrest Trading", value: "Bluecrest Trading" },
	{ name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const ServiceInvoiceTermOptions = [
	{ name: "--Select Terms--", value: "" },
	{ name: "Due on receipt", value: "Due on receipt" },
	{ name: "Net 15", value: "Net 15" },
	{ name: "Net 30", value: "Net 30" },
];

export const ServiceInvoiceDescriptionOptions = [
	{ name: "--Select Description--", value: "" },
	{ name: "Professional services", value: "Professional services" },
	{ name: "Consulting services", value: "Consulting services" },
	{ name: "Maintenance services", value: "Maintenance services" },
];

export const ServiceInvoiceDefaultAccountOptions = [
	{ name: "Accounts Receivable - Trade", value: "Accounts Receivable - Trade" },
	{ name: "Service Revenue", value: "Service Revenue" },
	{ name: "Unearned Revenue", value: "Unearned Revenue" },
];

export const ServiceInvoiceTeamOptions = [
	{ name: "--Select Team--", value: "" },
	{ name: "Operations", value: "Operations" },
	{ name: "Sales", value: "Sales" },
	{ name: "Admin", value: "Admin" },
];

export const ServiceInvoiceVatTypeOptions = [
	{ name: "VAT (12%)", value: "VAT (12%)" },
	{ name: "Zero-rated", value: "Zero-rated" },
	{ name: "VAT Exempt", value: "VAT Exempt" },
];

export const ServiceInvoiceBooleanOptions = [
	{ name: "True", value: "True" },
	{ name: "False", value: "False" },
];

export const ServiceInvoiceTaxTypeOptions = [
	{ name: "0.00", value: "0.00" },
	{ name: "1.00", value: "1.00" },
	{ name: "2.00", value: "2.00" },
	{ name: "5.00", value: "5.00" },
];

export const ServiceInvoiceResponsibilityCenterOptions = [
	{ name: "CC-ADM-001", value: "CC-ADM-001" },
	{ name: "CC-SLS-001", value: "CC-SLS-001" },
	{ name: "CC-OPS-001", value: "CC-OPS-001" },
];

export const MockServiceInvoices: ServiceInvoiceRecord[] = [
	{
		id: "svi-001",
		amount: 18450,
		customerCode: "CUST-001",
		customerName: "North Harbor Office Depot",
		documentDate: "2026-07-15",
		invoiceNo: "SVI-2026-0001",
		referenceNo: "PO-2026-0192",
		status: "Active",
		transactionNo: "SVI-2026-0001",
	},
	{
		id: "svi-002",
		amount: 62500,
		customerCode: "CUST-002",
		customerName: "Aster Foods Corporation",
		documentDate: "2026-07-11",
		invoiceNo: "SVI-2026-0002",
		referenceNo: "JO-2026-0048",
		status: "Pending",
		transactionNo: "SVI-2026-0002",
	},
	{
		id: "svi-003",
		amount: 93800,
		customerCode: "CUST-003",
		customerName: "Harborview Logistics",
		documentDate: "2026-07-08",
		invoiceNo: "SVI-2026-0003",
		referenceNo: "SO-2026-0105",
		status: "Approved",
		transactionNo: "SVI-2026-0003",
	},
];

export function createBlankServiceInvoiceLineEntry(
	overrides: Partial<ServiceInvoiceLineEntry> = {},
): ServiceInvoiceLineEntry {
	return {
		id: `svi-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
		withEwt: "True",
		ewtType: "2.00",
		responsibilityCenter: "",
		...overrides,
	};
}

export function createServiceInvoiceFormValues(): ServiceInvoiceFormValues {
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
		defaultAccount: "Accounts Receivable - Trade",
		teamAssigned: "",
		startDate: today,
		expirationDate: today,
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
		transactionNo: "SVI-2026-0004",
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
		lineEntries: [createBlankServiceInvoiceLineEntry()],
	};
}

export function createServiceInvoiceFormValuesFromRecord(
	record: ServiceInvoiceRecord,
): ServiceInvoiceFormValues {
	if (record.formValues) {
		return {
			...record.formValues,
			lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
		};
	}

	return {
		...createServiceInvoiceFormValues(),
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
			createBlankServiceInvoiceLineEntry({
				description: "Professional services",
				grossAmount: record.amount.toFixed(2),
				netAmount: record.amount.toFixed(2),
				particulars: record.referenceNo,
			}),
		],
	};
}

export function createServiceInvoiceRecordFromForm(
	values: ServiceInvoiceFormValues,
	existingRecord?: ServiceInvoiceRecord,
): ServiceInvoiceRecord {
	const totals = calculateServiceInvoiceTotals(values.lineEntries);
	const amount = totals.grossAmount || parseMoneyNumberInput(values.grossAmount);

	return {
		id: existingRecord?.id ?? `svi-${Date.now()}`,
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
		status: normalizeServiceInvoiceStatus(values.status),
		transactionNo: values.transactionNo,
	};
}

export function calculateServiceInvoiceTotals(
	entries: ServiceInvoiceLineEntry[],
): ServiceInvoiceTotals {
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

export function getInitialServiceInvoices() {
	return readStoredServiceInvoices() ?? MockServiceInvoices;
}

export function readStoredServiceInvoices() {
	if (typeof window === "undefined") {
		return null;
	}

	const storedRecords = window.localStorage.getItem(ServiceInvoiceStorageKey);

	if (!storedRecords) {
		return null;
	}

	try {
		const parsedRecords = JSON.parse(storedRecords) as ServiceInvoiceRecord[];

		return Array.isArray(parsedRecords) ? parsedRecords : null;
	} catch {
		return null;
	}
}

export function writeStoredServiceInvoices(records: ServiceInvoiceRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(ServiceInvoiceStorageKey, JSON.stringify(records));
}

export function formatServiceInvoiceAmount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatServiceInvoiceCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(amount);
}

export function formatServiceInvoiceDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function countServiceInvoicesByStatus(
	records: ServiceInvoiceRecord[],
	status: ServiceInvoiceStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function isServiceInvoiceActiveStatus(status: ServiceInvoiceStatus) {
	return status === "Active" || status === "Approved";
}

export function formatServiceInvoicePercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function serviceInvoiceEntryHasData(entry: ServiceInvoiceLineEntry) {
	return (
		entry.description.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}

export function serviceInvoiceEntryIsComplete(entry: ServiceInvoiceLineEntry) {
	return (
		entry.description.trim() !== "" &&
		(parseMoneyNumberInput(entry.netAmount) > 0 ||
			parseMoneyNumberInput(entry.grossAmount) > 0)
	);
}

function normalizeServiceInvoiceStatus(value: string): ServiceInvoiceStatus {
	const statuses: ServiceInvoiceStatus[] = [
		"Active",
		"Approved",
		"Cancelled",
		"Closed",
		"Disapproved",
		"Draft",
		"Pending",
	];

	return statuses.includes(value as ServiceInvoiceStatus)
		? (value as ServiceInvoiceStatus)
		: "Draft";
}
