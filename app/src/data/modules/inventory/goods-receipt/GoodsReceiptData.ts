import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	GoodsReceiptFormValues,
	GoodsReceiptLineEntry,
	GoodsReceiptRecord,
	GoodsReceiptStatus,
	GoodsReceiptTotals,
} from "@/app/src/types/modules/inventory/goods-receipt/GoodsReceiptTypes";

export const GoodsReceiptStorageKey = "gr8books.goods-receipt.records";

export const GoodsReceiptTransactionTypeOptions = [
	{ name: "--Select Transaction Type--", value: "" },
	{ name: "Goods Issue Return", value: "Goods Issue Return" },
	{ name: "Sales Return", value: "Sales Return" },
	{ name: "Stock Adjustment Receipt", value: "Stock Adjustment Receipt" },
	{ name: "Variance", value: "Variance" },
];

export const GoodsReceiptWarehouseOptions = [
	{ name: "--Select Warehouse--", value: "" },
	{ name: "Main Warehouse", value: "Main Warehouse" },
	{ name: "Transit Warehouse", value: "Transit Warehouse" },
	{ name: "Project Warehouse", value: "Project Warehouse" },
];

export const GoodsReceiptPartyOptions = [
	{ name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
	{ name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
	{ name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const GoodsReceiptUomOptions = [
	{ name: "PCS", value: "PCS" },
	{ name: "BOX", value: "BOX" },
	{ name: "PACK", value: "PACK" },
];

export const GoodsReceiptResponsibilityCenterOptions = [
	{ name: "CC-INV-001", value: "CC-INV-001" },
	{ name: "CC-OPS-001", value: "CC-OPS-001" },
	{ name: "CC-ADM-001", value: "CC-ADM-001" },
];

export const MockGoodsReceipts: GoodsReceiptRecord[] = [
	{
		id: "gr-001",
		documentDate: "2026-07-16",
		referenceNo: "GI-2026-0001",
		status: "Active",
		totalAmount: 18450,
		transactionNo: "GR-2026-0001",
		transactionType: "Goods Issue Return",
		vceName: "North Harbor Office Depot",
	},
	{
		id: "gr-002",
		documentDate: "2026-07-12",
		referenceNo: "IC-2026-0014",
		status: "Pending",
		totalAmount: 62500,
		transactionNo: "GR-2026-0002",
		transactionType: "Sales Return",
		vceName: "Aster Foods Corporation",
	},
	{
		id: "gr-003",
		documentDate: "2026-07-08",
		referenceNo: "SI-2026-0008",
		status: "Approved",
		totalAmount: 93800,
		transactionNo: "GR-2026-0003",
		transactionType: "Stock Adjustment Receipt",
		vceName: "Harborview Logistics",
	},
];

export function createBlankGoodsReceiptLineEntry(
	overrides: Partial<GoodsReceiptLineEntry> = {},
): GoodsReceiptLineEntry {
	return {
		id: `gr-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		barcode: "",
		itemName: "",
		itemCategory: "",
		uom: "PCS",
		lotNo: "",
		stockQuantity: "0.00",
		receivedQuantity: "0.00",
		unitCost: "0.00",
		amount: "0.00",
		referenceNo: "",
		responsibilityCenter: "",
		...overrides,
	};
}

export function createGoodsReceiptFormValues(): GoodsReceiptFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		transactionType: "",
		sourceWarehouse: "",
		receivingWarehouse: "",
		vceCode: "",
		vceName: "",
		remarks: "",
		transactionNo: "GR-2026-0004",
		documentDate: today,
		status: "Draft",
		icNo: "",
		giNo: "",
		siRef: "",
		projectRef: "",
		projectName: "",
		lineEntries: [createBlankGoodsReceiptLineEntry()],
	};
}

export function createGoodsReceiptFormValuesFromRecord(
	record: GoodsReceiptRecord,
): GoodsReceiptFormValues {
	if (record.formValues) {
		return {
			...record.formValues,
			receivingWarehouse: record.formValues.receivingWarehouse ?? "",
			lineEntries: record.formValues.lineEntries.map((entry) => ({ ...entry })),
		};
	}

	return {
		...createGoodsReceiptFormValues(),
		transactionNo: record.transactionNo,
		transactionType: record.transactionType,
		documentDate: record.documentDate,
		status: record.status,
		vceName: record.vceName,
		icNo: record.referenceNo.startsWith("IC") ? record.referenceNo : "",
		giNo: record.referenceNo.startsWith("GI") ? record.referenceNo : "",
		siRef: record.referenceNo.startsWith("SI") ? record.referenceNo : "",
		lineEntries: [
			createBlankGoodsReceiptLineEntry({
				itemCode: "ITEM-001",
				itemName: "Received inventory item",
				itemCategory: "Supplies",
				receivedQuantity: "1.00",
				unitCost: record.totalAmount.toFixed(2),
				amount: record.totalAmount.toFixed(2),
				referenceNo: record.referenceNo,
			}),
		],
	};
}

export function createGoodsReceiptRecordFromForm(
	values: GoodsReceiptFormValues,
	existingRecord?: GoodsReceiptRecord,
): GoodsReceiptRecord {
	const totals = calculateGoodsReceiptTotals(values.lineEntries);

	return {
		id: existingRecord?.id ?? `gr-${Date.now()}`,
		documentDate: values.documentDate,
		formValues: {
			...values,
			lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
		},
		referenceNo: values.icNo || values.giNo || values.siRef,
		status: normalizeGoodsReceiptStatus(values.status),
		totalAmount: totals.amount,
		transactionNo: values.transactionNo,
		transactionType: values.transactionType,
		vceName: values.vceName,
	};
}

export function calculateGoodsReceiptTotals(
	entries: GoodsReceiptLineEntry[],
): GoodsReceiptTotals {
	return entries.reduce(
		(summary, entry) => ({
			amount: summary.amount + parseMoneyNumberInput(entry.amount),
			receivedQuantity:
				summary.receivedQuantity + parseMoneyNumberInput(entry.receivedQuantity),
		}),
		{ amount: 0, receivedQuantity: 0 },
	);
}

export function getInitialGoodsReceipts() {
	return readStoredGoodsReceipts() ?? MockGoodsReceipts;
}

export function readStoredGoodsReceipts() {
	if (typeof window === "undefined") return null;

	const storedRecords = window.localStorage.getItem(GoodsReceiptStorageKey);
	if (!storedRecords) return null;

	try {
		const parsedRecords = JSON.parse(storedRecords) as GoodsReceiptRecord[];
		return Array.isArray(parsedRecords) ? parsedRecords : null;
	} catch {
		return null;
	}
}

export function writeStoredGoodsReceipts(records: GoodsReceiptRecord[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(GoodsReceiptStorageKey, JSON.stringify(records));
}

export function formatGoodsReceiptDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function formatGoodsReceiptCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(amount);
}

export function formatGoodsReceiptAmount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function countGoodsReceiptsByStatus(
	records: GoodsReceiptRecord[],
	status: GoodsReceiptStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function isGoodsReceiptActiveStatus(status: GoodsReceiptStatus) {
	return status === "Active" || status === "Approved";
}

export function formatGoodsReceiptPercentage(value: number, total: number) {
	return total === 0 ? "0.00% of total" : `${((value / total) * 100).toFixed(2)}% of total`;
}

export function goodsReceiptEntryHasData(entry: GoodsReceiptLineEntry) {
	return (
		entry.itemCode.trim() !== "" ||
		entry.itemName.trim() !== "" ||
		entry.referenceNo.trim() !== "" ||
		parseMoneyNumberInput(entry.receivedQuantity) > 0 ||
		parseMoneyNumberInput(entry.amount) > 0
	);
}

export function goodsReceiptEntryIsComplete(entry: GoodsReceiptLineEntry) {
	return (
		entry.itemCode.trim() !== "" &&
		parseMoneyNumberInput(entry.receivedQuantity) > 0
	);
}

function normalizeGoodsReceiptStatus(value: string): GoodsReceiptStatus {
	const statuses: GoodsReceiptStatus[] = [
		"Active",
		"Approved",
		"Cancelled",
		"Closed",
		"Disapproved",
		"Draft",
		"Pending",
	];

	return statuses.includes(value as GoodsReceiptStatus)
		? (value as GoodsReceiptStatus)
		: "Draft";
}
