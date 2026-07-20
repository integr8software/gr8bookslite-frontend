import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	DeliveryReceiptFormValues,
	DeliveryReceiptLineEntry,
	DeliveryReceiptRecord,
	DeliveryReceiptStatus,
} from "@/app/src/types/modules/inventory/delivery-receipt/DeliveryReceiptTypes";

export const DeliveryReceiptStorageKey = "gr8books.delivery-receipt.records";

export const DeliveryReceiptCurrencyOptions = [
	{ name: "PHP", value: "PHP" },
	{ name: "USD", value: "USD" },
];

export const DeliveryReceiptPartyOptions = [
	{ name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
	{ name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
	{ name: "Bluecrest Trading", value: "Bluecrest Trading" },
	{ name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const DeliveryReceiptBranchOptions = [
	{ name: "--Select Branch--", value: "" },
	{ name: "Head Office", value: "Head Office" },
	{ name: "Warehouse A", value: "Warehouse A" },
	{ name: "Warehouse B", value: "Warehouse B" },
];

export const DeliveryReceiptTermOptions = [
	{ name: "--Select Terms--", value: "" },
	{ name: "Due on receipt", value: "Due on receipt" },
	{ name: "Net 15", value: "Net 15" },
	{ name: "Net 30", value: "Net 30" },
];

export const DeliveryReceiptUomOptions = [
	{ name: "PCS", value: "PCS" },
	{ name: "BOX", value: "BOX" },
	{ name: "PACK", value: "PACK" },
];

export const DeliveryReceiptWarehouseOptions = [
	{ name: "--Select Warehouse--", value: "" },
	{ name: "Main Warehouse", value: "Main Warehouse" },
	{ name: "Transit Warehouse", value: "Transit Warehouse" },
];

export const DeliveryReceiptResponsibilityCenterOptions = [
	{ name: "CC-INV-001", value: "CC-INV-001" },
	{ name: "CC-OPS-001", value: "CC-OPS-001" },
	{ name: "CC-ADM-001", value: "CC-ADM-001" },
];

export const MockDeliveryReceipts: DeliveryReceiptRecord[] = [
	{
		id: "dr-001",
		customerCode: "VCE-001",
		customerName: "North Harbor Office Depot",
		deliveryDate: "2026-07-16",
		documentDate: "2026-07-16",
		referenceNo: "SO-2026-0101",
		status: "Active",
		totalQuantity: 18,
		transactionNo: "DR-2026-0001",
	},
	{
		id: "dr-002",
		customerCode: "VCE-002",
		customerName: "Aster Foods Corporation",
		deliveryDate: "2026-07-14",
		documentDate: "2026-07-14",
		referenceNo: "PO-2026-0144",
		status: "Pending",
		totalQuantity: 32,
		transactionNo: "DR-2026-0002",
	},
	{
		id: "dr-003",
		customerCode: "VCE-003",
		customerName: "Harborview Logistics",
		deliveryDate: "2026-07-10",
		documentDate: "2026-07-10",
		referenceNo: "SO-2026-0096",
		status: "Approved",
		totalQuantity: 12,
		transactionNo: "DR-2026-0003",
	},
];

export function createBlankDeliveryReceiptLineEntry(
	overrides: Partial<DeliveryReceiptLineEntry> = {},
): DeliveryReceiptLineEntry {
	return {
		id: `dr-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		barcode: "",
		name: "",
		description: "",
		serialNo: "",
		quantity: "0.00",
		uom: "PCS",
		lotNo: "",
		warehouse: "",
		stockQuantity: "0.00",
		responsibilityCenter: "",
		particulars: "",
		...overrides,
	};
}

export function createDeliveryReceiptFormValues(): DeliveryReceiptFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		vceCode: "",
		vceName: "",
		billToCode: "",
		billToName: "",
		currency: "PHP",
		exchangeRate: "1.0000",
		address: "",
		branch: "",
		contactNo: "",
		remarks: "",
		terms: "",
		dueDate: today,
		deliveryDate: today,
		driverName: "",
		plateNo: "",
		transactionNo: "DR-2026-0004",
		documentDate: today,
		soNo: "",
		soDate: "",
		poNo: "",
		status: "Draft",
		projectRef: "",
		lineEntries: [createBlankDeliveryReceiptLineEntry()],
	};
}

export function createDeliveryReceiptFormValuesFromRecord(
	record: DeliveryReceiptRecord,
): DeliveryReceiptFormValues {
	if (record.formValues) {
		return {
			...record.formValues,
			lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
		};
	}

	return {
		...createDeliveryReceiptFormValues(),
		vceCode: record.customerCode,
		vceName: record.customerName,
		billToName: record.customerName,
		deliveryDate: record.deliveryDate,
		documentDate: record.documentDate,
		soNo: record.referenceNo,
		status: record.status,
		transactionNo: record.transactionNo,
		lineEntries: [
			createBlankDeliveryReceiptLineEntry({
				itemCode: "ITEM-001",
				name: "Inventory item",
				description: "Delivered goods",
				quantity: record.totalQuantity.toFixed(2),
				warehouse: "Main Warehouse",
				particulars: record.referenceNo,
			}),
		],
	};
}

export function createDeliveryReceiptRecordFromForm(
	values: DeliveryReceiptFormValues,
	existingRecord?: DeliveryReceiptRecord,
): DeliveryReceiptRecord {
	return {
		id: existingRecord?.id ?? `dr-${Date.now()}`,
		customerCode: values.vceCode,
		customerName: values.vceName,
		deliveryDate: values.deliveryDate,
		documentDate: values.documentDate,
		formValues: {
			...values,
			lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
		},
		referenceNo: values.soNo || values.poNo || values.projectRef,
		status: normalizeDeliveryReceiptStatus(values.status),
		totalQuantity: calculateDeliveryReceiptTotalQuantity(values.lineEntries),
		transactionNo: values.transactionNo,
	};
}

export function calculateDeliveryReceiptTotalQuantity(
	entries: DeliveryReceiptLineEntry[],
) {
	return entries.reduce(
		(total, entry) => total + parseMoneyNumberInput(entry.quantity),
		0,
	);
}

export function getInitialDeliveryReceipts() {
	return readStoredDeliveryReceipts() ?? MockDeliveryReceipts;
}

export function readStoredDeliveryReceipts() {
	if (typeof window === "undefined") {
		return null;
	}

	const storedRecords = window.localStorage.getItem(DeliveryReceiptStorageKey);

	if (!storedRecords) {
		return null;
	}

	try {
		const parsedRecords = JSON.parse(storedRecords) as DeliveryReceiptRecord[];

		return Array.isArray(parsedRecords) ? parsedRecords : null;
	} catch {
		return null;
	}
}

export function writeStoredDeliveryReceipts(records: DeliveryReceiptRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(DeliveryReceiptStorageKey, JSON.stringify(records));
}

export function formatDeliveryReceiptDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function formatDeliveryReceiptQuantity(value: number) {
	return value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function countDeliveryReceiptsByStatus(
	records: DeliveryReceiptRecord[],
	status: DeliveryReceiptStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function isDeliveryReceiptActiveStatus(status: DeliveryReceiptStatus) {
	return status === "Active" || status === "Approved";
}

export function formatDeliveryReceiptPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function deliveryReceiptEntryHasData(entry: DeliveryReceiptLineEntry) {
	return (
		entry.itemCode.trim() !== "" ||
		entry.name.trim() !== "" ||
		entry.description.trim() !== "" ||
		entry.particulars.trim() !== "" ||
		parseMoneyNumberInput(entry.quantity) > 0
	);
}

export function deliveryReceiptEntryIsComplete(
	entry: DeliveryReceiptLineEntry,
) {
	return (
		(entry.itemCode.trim() !== "" || entry.name.trim() !== "") &&
		parseMoneyNumberInput(entry.quantity) > 0
	);
}

function normalizeDeliveryReceiptStatus(value: string): DeliveryReceiptStatus {
	const statuses: DeliveryReceiptStatus[] = [
		"Active",
		"Approved",
		"Cancelled",
		"Closed",
		"Disapproved",
		"Draft",
		"Pending",
	];

	return statuses.includes(value as DeliveryReceiptStatus)
		? (value as DeliveryReceiptStatus)
		: "Draft";
}
