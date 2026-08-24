import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	BillingAccountingEntry,
	BillingFormValues,
	BillingLineEntry,
	BillingRecord,
	BillingStatus,
	BillingTotals,
} from "@/app/src/types/modules/sales/billing/BillingTypes";

export const BillingStorageKey = "gr8books.billing.records";

export const BillingCurrencyOptions = [
	{ name: "PHP", value: "PHP" },
	{ name: "USD", value: "USD" },
];

export const BillingPartyOptions = [
	{
		label: "CUST-001",
		name: "North Harbor Office Depot",
		selectedDetails: "CUST-001",
		value: "North Harbor Office Depot",
	},
	{
		label: "CUST-002",
		name: "Aster Foods Corporation",
		selectedDetails: "CUST-002",
		value: "Aster Foods Corporation",
	},
	{
		label: "CUST-003",
		name: "Bluecrest Trading",
		selectedDetails: "CUST-003",
		value: "Bluecrest Trading",
	},
	{
		label: "CUST-004",
		name: "Harborview Logistics",
		selectedDetails: "CUST-004",
		value: "Harborview Logistics",
	},
];

export const BillingResponsibilityCenterOptions = [
	{ name: "CC-ADM-001", value: "CC-ADM-001" },
	{ name: "CC-SLS-001", value: "CC-SLS-001" },
	{ name: "CC-OPS-001", value: "CC-OPS-001" },
];

export const BillingStatusOptions = [
	{ name: "Draft", value: "Draft" },
	{ name: "For Approval", value: "For Approval" },
	{ name: "Posted", value: "Posted" },
	{ name: "Disapproved", value: "Disapproved" },
	{ name: "Cancelled", value: "Cancelled" },
];

export const BillingTermOptions = [
	{ name: "--Select Terms--", value: "" },
	{ name: "Due on receipt", value: "Due on receipt" },
	{ name: "Net 15", value: "Net 15" },
	{ name: "Net 30", value: "Net 30" },
];

export const BillingDescriptionOptions = [
	{ name: "--Select Description--", value: "" },
	{ name: "Professional services", value: "Professional services" },
	{ name: "Consulting services", value: "Consulting services" },
	{ name: "Maintenance services", value: "Maintenance services" },
];

export const BillingDefaultAccountOptions = [
	{ name: "Accounts Receivable - Trade", value: "Accounts Receivable - Trade" },
	{ name: "Service Revenue", value: "Service Revenue" },
	{ name: "Unearned Revenue", value: "Unearned Revenue" },
];

export const BillingTeamOptions = [
	{ name: "--Select Team--", value: "" },
	{ name: "Operations", value: "Operations" },
	{ name: "Sales", value: "Sales" },
	{ name: "Admin", value: "Admin" },
];

export const BillingVatTypeOptions = [
	{ name: "VAT (12%)", value: "VAT (12%)" },
	{ name: "Zero-rated", value: "Zero-rated" },
	{ name: "VAT Exempt", value: "VAT Exempt" },
];

export const BillingBooleanOptions = [
	{ name: "True", value: "True" },
	{ name: "False", value: "False" },
];

export const BillingTaxTypeOptions = [
	{ name: "0.00", value: "0.00" },
	{ name: "1.00", value: "1.00" },
	{ name: "2.00", value: "2.00" },
	{ name: "5.00", value: "5.00" },
];

export const MockBillings: BillingRecord[] = [];

export function createBlankBillingLineEntry(
	overrides: Partial<BillingLineEntry> = {},
): BillingLineEntry {
	return {
		id: `b-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
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
		grossAfterDiscount: "0.00",
		netOfVatAmount: "0.00",
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

export function createBillingFormValues(): BillingFormValues {
	const today = new Date().toISOString().slice(0, 10);
	const lineEntries = [createBlankBillingLineEntry()];

	const values = {
		address: "",
		attachments: [],
		billToName: "",
		code: "",
		name: "",
		currency: "PHP",
		exchangeRate: "1.0000",
		contactPerson: "",
		contactNo: "",
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
		transactionNo: "B-2026-0004",
		documentDate: today,
		sjNo: "",
		joNo: "",
		poNo: "",
		invoiceNo: "",
		referenceNo: "",
		businessStyle: "",
		status: "Draft",
		projectRef: "",
		projectCode: "",
		projectName: "",
		soNo: "",
		lineEntries,
	};

	return {
		...values,
		accountingEntries: createBillingAccountingEntries(values),
	};
}

export function createBillingFormValuesFromRecord(
	record: BillingRecord,
): BillingFormValues {
	if (record.formValues) {
		const defaultValues = createBillingFormValues();
		const formValues = {
			...defaultValues,
			...record.formValues,
			attachments:
				record.formValues.attachments?.map((attachment) => ({
					...attachment,
				})) ?? [],
			lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
		};

		return {
			...formValues,
			accountingEntries:
				record.formValues.accountingEntries?.map((entry) => ({ ...entry })) ??
				createBillingAccountingEntries(formValues),
		};
	}

	const values = {
		...createBillingFormValues(),
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
			createBlankBillingLineEntry({
				description: "Professional services",
				grossAmount: record.amount.toFixed(2),
				netAmount: record.amount.toFixed(2),
				particulars: record.referenceNo,
			}),
		],
	};

	return {
		...values,
		accountingEntries: createBillingAccountingEntries(values),
	};
}

export function createBillingRecordFromForm(
	values: BillingFormValues,
	existingRecord?: BillingRecord,
): BillingRecord {
	const totals = calculateBillingTotals(values.lineEntries);
	const amount = totals.grossAmount || parseMoneyNumberInput(values.grossAmount);

	return {
		id: existingRecord?.id ?? `b-${Date.now()}`,
		amount,
		customerCode: values.code,
		customerName: values.name,
		documentDate: values.documentDate,
		formValues: {
			...values,
			attachments: values.attachments.map((attachment) => ({
				...attachment,
			})),
			lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
		},
		invoiceNo: values.invoiceNo || values.transactionNo,
		referenceNo: values.referenceNo || values.poNo || values.joNo,
		status: normalizeBillingStatus(values.status),
		transactionNo: values.transactionNo,
	};
}

export function calculateBillingTotals(
	entries: BillingLineEntry[],
): BillingTotals {
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

export function createBillingAccountingEntries({
	defaultAccount,
	lineEntries,
}: Pick<
	BillingFormValues,
	"defaultAccount" | "lineEntries"
>): BillingAccountingEntry[] {
	const totals = calculateBillingTotals(lineEntries);
	const receivableAmount = Math.max(0, totals.grossAmount);
	const discountAmount = Math.max(0, totals.discountAmount);
	const vatAmount = Math.max(0, totals.vatAmount);
	const serviceAmount = Math.max(
		0,
		receivableAmount + discountAmount - vatAmount,
	);

	return [
		{
			id: "accounts-receivable",
			accountCode: "AR-TRADE",
			accountTitle: defaultAccount || "Accounts Receivable - Trade",
			debit: receivableAmount,
			credit: 0,
			partyCode: "",
			partyName: "",
			particulars: "",
			vatType: "",
			atcCode: "",
			responsibilityCenter: "",
			refNo: "",
		},
		{
			id: "sales-discount",
			accountCode: "SALES-DISC",
			accountTitle: "Sales Discount",
			debit: discountAmount,
			credit: 0,
			partyCode: "",
			partyName: "",
			particulars: "",
			vatType: "",
			atcCode: "",
			responsibilityCenter: "",
			refNo: "",
		},
		{
			id: "output-tax",
			accountCode: "VAT-OUT",
			accountTitle: "Output Tax",
			debit: 0,
			credit: vatAmount,
			partyCode: "",
			partyName: "",
			particulars: "",
			vatType: "",
			atcCode: "",
			responsibilityCenter: "",
			refNo: "",
		},
		{
			id: "service-fees",
			accountCode: "SRV-FEE",
			accountTitle: "Service Fees",
			debit: 0,
			credit: serviceAmount,
			partyCode: "",
			partyName: "",
			particulars: "",
			vatType: "",
			atcCode: "",
			responsibilityCenter: "",
			refNo: "",
		},
	];
}

export function getInitialBillings() {
	return readStoredBillings() ?? [];
}

export function readStoredBillings() {
	if (typeof window === "undefined") {
		return null;
	}

	const storedRecords = window.localStorage.getItem(BillingStorageKey);

	if (!storedRecords) {
		return null;
	}

	try {
		const parsedRecords = JSON.parse(storedRecords) as BillingRecord[];

		return Array.isArray(parsedRecords)
			? parsedRecords.map(normalizeStoredBillingRecord)
			: null;
	} catch {
		return null;
	}
}

export function writeStoredBillings(records: BillingRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(BillingStorageKey, JSON.stringify(records));
}

export function formatBillingAmount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatBillingCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(amount);
}

export function formatBillingDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function countBillingsByStatus(
	records: BillingRecord[],
	status: BillingStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function isBillingActiveStatus(status: BillingStatus) {
	return status === "For Approval" || status === "Posted";
}

export function formatBillingPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function billingEntryHasData(entry: BillingLineEntry) {
	return (
		entry.description.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		entry.responsibilityCenter.trim() !== "" ||
		parseMoneyNumberInput(entry.amount) > 0 ||
		parseMoneyNumberInput(entry.netAmount) > 0 ||
		parseMoneyNumberInput(entry.grossAmount) > 0
	);
}

export function billingEntryIsComplete(entry: BillingLineEntry) {
	return (
		entry.description.trim() !== "" &&
		(parseMoneyNumberInput(entry.netAmount) > 0 ||
			parseMoneyNumberInput(entry.grossAmount) > 0)
	);
}

function normalizeBillingStatus(value: string): BillingStatus {
	const legacyStatusMap: Record<string, BillingStatus> = {
		Active: "Posted",
		Approved: "Posted",
		Closed: "Posted",
		Pending: "For Approval",
	};
	const statuses: BillingStatus[] = [
		"Cancelled",
		"Disapproved",
		"Draft",
		"For Approval",
		"Posted",
	];

	if (legacyStatusMap[value]) {
		return legacyStatusMap[value];
	}

	return statuses.includes(value as BillingStatus)
		? (value as BillingStatus)
		: "Draft";
}

function normalizeStoredBillingRecord(
	record: BillingRecord,
): BillingRecord {
	const status = normalizeBillingStatus(record.status);

	return {
		...record,
		formValues: record.formValues
			? {
					...record.formValues,
					status: normalizeBillingStatus(record.formValues.status),
				}
			: record.formValues,
		status,
	};
}
