import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";

export const ReceivingReportStorageKey = "gr8books.receiving-report.records";

export type ReceivingReportStatus =
	| "Approved"
	| "Cancelled"
	| "Closed"
	| "Disapproved"
	| "Draft"
	| "Pending";

export type ReceivingReportLine = {
	id: string;
	itemCode: string;
	barcode: string;
	description: string;
	itemCategory: string;
	serialNo: string;
	warehouse: string;
	poQty: string;
	rrQty: string;
	uom: string;
	expiryDate: string;
	freightCost: string;
	cost: string;
	grossAmount: string;
	vatAmount: string;
	discountAmount: string;
	ewtAmount: string;
	atc: string;
	netAmount: string;
	vatable: string;
	vatInclusive: string;
	withEwt: string;
	responsibilityCenter: string;
};

export type ReceivingReportFormValues = {
	vceCode: string;
	vceName: string;
	currency: string;
	exchangeRate: string;
	address: string;
	contactNo: string;
	deliveryDate: string;
	remarks: string;
	defaultAccount: string;
	grossAmount: string;
	discountAmount: string;
	vatAmount: string;
	ewtAmount: string;
	netAmount: string;
	warehouse: string;
	status: string;
	transNo: string;
	documentDate: string;
	drNo: string;
	poNo: string;
	prNo: string;
	siNo: string;
	importationRefNo: string;
	projectRef: string;
	projectName: string;
	pjNo: string;
	lines: ReceivingReportLine[];
};

export type ReceivingReportRecord = {
	id: string;
	documentDate: string;
	formValues?: ReceivingReportFormValues;
	netAmount: number;
	poNo: string;
	status: ReceivingReportStatus;
	transactionNo: string;
	vceCode: string;
	vceName: string;
	warehouse: string;
};

export type ReceivingReportTotals = {
	discountAmount: number;
	ewtAmount: number;
	grossAmount: number;
	netAmount: number;
	vatAmount: number;
};

export const MockReceivingReports: ReceivingReportRecord[] = [
	createReceivingReportRecordFromForm(createMockReceivingReportFormValues(), {
		id: "rr-000400",
	}),
	createReceivingReportRecordFromForm(
		{
			...createReceivingReportFormValues(),
			address: "Blk 12 North Harbor, Manila",
			contactNo: "0917-555-0138",
			defaultAccount: "Accounts Payable - Trade",
			deliveryDate: "2026-03-22",
			documentDate: "2026-03-22",
			poNo: "PO-000399",
			status: "Draft",
			transNo: "RR-000399",
			vceCode: "SUP-00017",
			vceName: "Northstar Industrial Supply",
			warehouse: "Manila",
			lines: [
				createReceivingReportLine({
					itemCode: "ITEM-ADH-001",
					description: "Industrial adhesive",
					itemCategory: "Supplies",
					poQty: "12.00",
					rrQty: "8.00",
					uom: "BOX",
					cost: "16056.34",
					grossAmount: "114688.17",
					vatAmount: "13762.58",
					netAmount: "128450.75",
				}),
			],
		},
		{ id: "rr-000399" },
	),
	createReceivingReportRecordFromForm(
		{
			...createReceivingReportFormValues(),
			address: "Cebu Business Park, Cebu City",
			contactNo: "0922-881-4471",
			defaultAccount: "Goods Received Not Invoiced",
			deliveryDate: "2026-03-18",
			documentDate: "2026-03-18",
			poNo: "PO-000398",
			status: "Closed",
			transNo: "RR-000398",
			vceCode: "SUP-00016",
			vceName: "Brightline Packaging Corp.",
			warehouse: "Cebu",
			lines: [
				createReceivingReportLine({
					itemCode: "ITEM-PKG-042",
					description: "Corrugated packaging sheets",
					itemCategory: "Packaging",
					poQty: "100.00",
					rrQty: "100.00",
					uom: "PCS",
					cost: "776.07",
					grossAmount: "77607.14",
					vatAmount: "9312.86",
					netAmount: "86920.00",
				}),
			],
		},
		{ id: "rr-000398" },
	),
];

export function createReceivingReportFormValues(): ReceivingReportFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		vceCode: "SUP-NEW",
		vceName: "",
		currency: "PHP",
		exchangeRate: "1.0000",
		address: "",
		contactNo: "",
		deliveryDate: today,
		remarks: "",
		defaultAccount: "--Select Credit Account--",
		grossAmount: "0.0000",
		discountAmount: "0.0000",
		vatAmount: "0.0000",
		ewtAmount: "0.0000",
		netAmount: "0.0000",
		warehouse: "Laguna",
		status: "Draft",
		transNo: "RR-000401",
		documentDate: today,
		drNo: "",
		poNo: "",
		prNo: "",
		siNo: "",
		importationRefNo: "",
		projectRef: "",
		projectName: "",
		pjNo: "",
		lines: [createReceivingReportLine()],
	};
}

export function createReceivingReportFormValuesFromRecord(
	record: ReceivingReportRecord,
): ReceivingReportFormValues {
	if (record.formValues) {
		return {
			...createReceivingReportFormValues(),
			...record.formValues,
			lines: record.formValues.lines.map((line) => ({ ...line })),
		};
	}

	return {
		...createReceivingReportFormValues(),
		documentDate: record.documentDate,
		poNo: record.poNo,
		status: record.status,
		transNo: record.transactionNo,
		vceCode: record.vceCode,
		vceName: record.vceName,
		warehouse: record.warehouse,
		lines: [
			createReceivingReportLine({
				itemCode: "ITEM-001",
				description: "Received inventory item",
				grossAmount: record.netAmount.toFixed(2),
				netAmount: record.netAmount.toFixed(2),
				rrQty: "1.00",
				uom: "PCS",
			}),
		],
	};
}

export function createReceivingReportRecordFromForm(
	values: ReceivingReportFormValues,
	existingRecord?: Pick<ReceivingReportRecord, "id">,
): ReceivingReportRecord {
	const totals = calculateReceivingReportTotals(values.lines);

	return {
		id: existingRecord?.id ?? `rr-${Date.now()}`,
		documentDate: values.documentDate,
		formValues: {
			...values,
			lines: values.lines.map((line) => ({ ...line })),
		},
		netAmount: totals.netAmount,
		poNo: values.poNo,
		status: normalizeReceivingReportStatus(values.status),
		transactionNo: values.transNo,
		vceCode: values.vceCode,
		vceName: values.vceName,
		warehouse: values.warehouse,
	};
}

export function createReceivingReportLine(
	overrides: Partial<ReceivingReportLine> = {},
): ReceivingReportLine {
	return {
		id: `rr-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		barcode: "",
		description: "",
		itemCategory: "",
		serialNo: "",
		warehouse: "Laguna",
		poQty: "0.00",
		rrQty: "0.00",
		uom: "",
		expiryDate: "",
		freightCost: "0.00",
		cost: "0.00",
		grossAmount: "0.0000",
		vatAmount: "0.0000",
		discountAmount: "0.00",
		ewtAmount: "0.0000",
		atc: "",
		netAmount: "0.0000",
		vatable: "False",
		vatInclusive: "False",
		withEwt: "False",
		responsibilityCenter: "",
		...overrides,
	};
}

export function calculateReceivingReportTotals(
	lines: ReceivingReportLine[],
): ReceivingReportTotals {
	return lines.reduce(
		(totals, line) => ({
			discountAmount:
				totals.discountAmount + parseMoneyNumberInput(line.discountAmount),
			ewtAmount: totals.ewtAmount + parseMoneyNumberInput(line.ewtAmount),
			grossAmount: totals.grossAmount + parseMoneyNumberInput(line.grossAmount),
			netAmount: totals.netAmount + parseMoneyNumberInput(line.netAmount),
			vatAmount: totals.vatAmount + parseMoneyNumberInput(line.vatAmount),
		}),
		{
			discountAmount: 0,
			ewtAmount: 0,
			grossAmount: 0,
			netAmount: 0,
			vatAmount: 0,
		},
	);
}

export function getInitialReceivingReports() {
	return readStoredReceivingReports() ?? MockReceivingReports;
}

export function readStoredReceivingReports() {
	if (typeof window === "undefined") return null;

	const storedRecords = window.localStorage.getItem(ReceivingReportStorageKey);
	if (!storedRecords) return null;

	try {
		const parsedRecords = JSON.parse(storedRecords) as ReceivingReportRecord[];
		return Array.isArray(parsedRecords) ? parsedRecords : null;
	} catch {
		return null;
	}
}

export function writeStoredReceivingReports(records: ReceivingReportRecord[]) {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(ReceivingReportStorageKey, JSON.stringify(records));
}

export function upsertReceivingReportRecord(record: ReceivingReportRecord) {
	const records = getInitialReceivingReports();
	const existingIndex = records.findIndex(
		(currentRecord) => currentRecord.id === record.id,
	);
	const nextRecords =
		existingIndex === -1
			? [record, ...records]
			: records.map((currentRecord) =>
					currentRecord.id === record.id ? record : currentRecord,
				);

	writeStoredReceivingReports(nextRecords);

	return nextRecords;
}

export function createNextReceivingReportNo(records: ReceivingReportRecord[]) {
	const highest = records.reduce((currentHighest, record) => {
		const numeric = Number.parseInt(record.transactionNo.replace(/\D/g, ""), 10);

		return Number.isFinite(numeric)
			? Math.max(currentHighest, numeric)
			: currentHighest;
	}, 400);

	return `RR-${String(highest + 1).padStart(6, "0")}`;
}

export function formatReceivingReportDate(value: string) {
	return new Intl.DateTimeFormat("en-US", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(value));
}

export function formatReceivingReportCurrency(value: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(value);
}

export function formatReceivingReportPercentage(count: number, total: number) {
	if (total <= 0) return "0% of records";

	return `${Math.round((count / total) * 100)}% of records`;
}

export function countReceivingReportsByStatus(
	records: ReceivingReportRecord[],
	status: ReceivingReportStatus,
) {
	return records.filter((record) => record.status === status).length;
}

function createMockReceivingReportFormValues(): ReceivingReportFormValues {
	return {
		...createReceivingReportFormValues(),
		address: "Abc, 123, Sample, Malamig, City Of Mandaluyong, NCR",
		contactNo: "0967-237-4514",
		defaultAccount: "Accounts Payable - Trade",
		deliveryDate: "2026-03-24",
		documentDate: "2026-03-24",
		poNo: "PO-000400",
		siNo: "SI-000400",
		status: "Approved",
		transNo: "RR-000400",
		drNo: "DR-000400",
		vceCode: "SUP-00018",
		vceName: "RMBT Corporation-yes",
		prNo: "PR-000400",
		warehouse: "Laguna",
		lines: [
			createReceivingReportLine({
				itemCode: "ITEM-TOPCOAT-MATTE",
				description: "Topcoat Matte",
				itemCategory: "Paint",
				poQty: "10.00",
				rrQty: "5.00",
				uom: "PC",
				cost: "102831.00",
				grossAmount: "459066.96",
				vatAmount: "55088.04",
				netAmount: "514155.00",
				responsibilityCenter: "Warehouse",
			}),
		],
	};
}

function normalizeReceivingReportStatus(value: string): ReceivingReportStatus {
	const statuses: ReceivingReportStatus[] = [
		"Approved",
		"Cancelled",
		"Closed",
		"Disapproved",
		"Draft",
		"Pending",
	];

	return statuses.includes(value as ReceivingReportStatus)
		? (value as ReceivingReportStatus)
		: "Draft";
}
