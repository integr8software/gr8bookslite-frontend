import { parseMoneyNumberInput } from "@/app/src/data/shared/money/MoneyNumberData";
import type {
	GoodsIssueFormValues,
	GoodsIssueLineEntry,
	GoodsIssueMaterialRequestCopyRecord,
	GoodsIssueRecord,
	GoodsIssueStatus,
	GoodsIssueTotals,
} from "@/app/src/types/modules/inventory/goods-issue/GoodsIssueTypes";

export const GoodsIssueStorageKey = "gr8books.goods-issue.records";

export const GoodsIssueTransactionTypeOptions = [
	{ name: "--Select Goods Issue Type--", value: "" },
	{ name: "Inventory Issue", value: "Inventory Issue" },
	{ name: "Material Request Issue", value: "Material Request Issue" },
	{ name: "Variance", value: "Variance" },
];

export const GoodsIssueCurrencyOptions = [
	{ name: "PHP", value: "PHP" },
	{ name: "USD", value: "USD" },
];

export const GoodsIssueWarehouseOptions = [
	{ name: "--Select Warehouse--", value: "" },
	{ name: "Main Warehouse", value: "Main Warehouse" },
	{ name: "Transit Warehouse", value: "Transit Warehouse" },
	{ name: "Project Warehouse", value: "Project Warehouse" },
];

export const GoodsIssuePartyOptions = [
	{ name: "North Harbor Office Depot", value: "North Harbor Office Depot" },
	{ name: "Aster Foods Corporation", value: "Aster Foods Corporation" },
	{ name: "Harborview Logistics", value: "Harborview Logistics" },
];

export const GoodsIssueUomOptions = [
	{ name: "PCS", value: "PCS" },
	{ name: "BOX", value: "BOX" },
	{ name: "PACK", value: "PACK" },
];

export const GoodsIssueResponsibilityCenterOptions = [
	{ name: "CC-INV-001", value: "CC-INV-001" },
	{ name: "CC-OPS-001", value: "CC-OPS-001" },
	{ name: "CC-ADM-001", value: "CC-ADM-001" },
];

export const GoodsIssueMaterialRequestCopyRecords: GoodsIssueMaterialRequestCopyRecord[] =
	[
		{
			id: "mr-001",
			documentDate: "2026-07-16",
			itemCategory: "Supplies",
			itemCode: "ITEM-001",
			mrNo: "MR-2026-0031",
			partyCode: "VCE-001",
			partyName: "North Harbor Office Depot",
			remarks: "Office supplies material request.",
			requestedQuantity: "18.00",
			source: "Material Request",
			sourceNo: "MR-2026-0031",
			uom: "PCS",
			warehouse: "Main Warehouse",
		},
		{
			id: "mr-002",
			documentDate: "2026-07-14",
			itemCategory: "Consumables",
			itemCode: "ITEM-002",
			mrNo: "MR-2026-0028",
			partyCode: "VCE-002",
			partyName: "Aster Foods Corporation",
			remarks: "Warehouse consumables request.",
			requestedQuantity: "8.00",
			source: "Material Request",
			sourceNo: "MR-2026-0028",
			uom: "BOX",
			warehouse: "Project Warehouse",
		},
		{
			id: "rr-001",
			documentDate: "2026-07-13",
			itemCategory: "Inventory",
			itemCode: "ITEM-003",
			mrNo: "",
			partyCode: "VCE-003",
			partyName: "Harborview Logistics",
			remarks: "Receiving report goods issue.",
			requestedQuantity: "12.00",
			source: "Receiving Report",
			sourceNo: "RR-2026-0014",
			uom: "PCS",
			warehouse: "Main Warehouse",
		},
		{
			id: "ic-001",
			documentDate: "2026-07-11",
			itemCategory: "Inventory",
			itemCode: "ITEM-004",
			mrNo: "",
			partyCode: "VCE-001",
			partyName: "North Harbor Office Depot",
			remarks: "Inventory count variance.",
			requestedQuantity: "5.00",
			source: "Inventory Count",
			sourceNo: "IC-2026-0008",
			uom: "PCS",
			warehouse: "Main Warehouse",
		},
		{
			id: "jo-001",
			documentDate: "2026-07-10",
			itemCategory: "Production",
			itemCode: "ITEM-005",
			mrNo: "",
			partyCode: "VCE-002",
			partyName: "Aster Foods Corporation",
			remarks: "Job order material issue.",
			requestedQuantity: "20.00",
			source: "Job Order",
			sourceNo: "JO-2026-0048",
			uom: "PACK",
			warehouse: "Project Warehouse",
		},
	];

export const MockGoodsIssues: GoodsIssueRecord[] = [
	{
		id: "gi-001",
		documentDate: "2026-07-16",
		referenceNo: "MR-2026-0031",
		status: "Active",
		totalAmount: 18450,
		transactionNo: "GI-2026-0001",
		transactionType: "Material Request Issue",
		vceName: "North Harbor Office Depot",
	},
	{
		id: "gi-002",
		documentDate: "2026-07-12",
		referenceNo: "RR-2026-0014",
		status: "Pending",
		totalAmount: 62500,
		transactionNo: "GI-2026-0002",
		transactionType: "Inventory Issue",
		vceName: "Aster Foods Corporation",
	},
];

export function createBlankGoodsIssueLineEntry(
	overrides: Partial<GoodsIssueLineEntry> = {},
): GoodsIssueLineEntry {
	return {
		id: `gi-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		barcode: "",
		itemName: "",
		itemCategory: "",
		uom: "PCS",
		mfgDate: "",
		expirationDate: "",
		lotNo: "",
		serialNo: "",
		stockQuantity: "0.00",
		issueQuantity: "0.00",
		remainingQuantity: "0.00",
		unitCost: "0.0000",
		amount: "0.00",
		referenceNo: "",
		responsibilityCenter: "",
		color: "",
		brand: "",
		size: "",
		model: "",
		...overrides,
	};
}

export function createGoodsIssueFormValues(): GoodsIssueFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		transactionType: "",
		sourceWarehouse: "",
		vceCode: "",
		vceName: "",
		currency: "PHP",
		exchangeRate: "1.0000",
		remarks: "",
		transactionNo: "GI-2026-0004",
		documentDate: today,
		status: "Draft",
		mrNo: "",
		rrNo: "",
		icNo: "",
		joNo: "",
		projectRef: "",
		projectName: "",
		lineEntries: [createBlankGoodsIssueLineEntry()],
	};
}

export function createGoodsIssueFormValuesFromRecord(
	record: GoodsIssueRecord,
): GoodsIssueFormValues {
	if (record.formValues) {
		const defaults = createGoodsIssueFormValues();

		return {
			...defaults,
			...record.formValues,
			lineEntries: record.formValues.lineEntries.map((entry) => ({
				...createBlankGoodsIssueLineEntry(),
				...entry,
			})),
		};
	}

	return {
		...createGoodsIssueFormValues(),
		transactionNo: record.transactionNo,
		transactionType: record.transactionType,
		documentDate: record.documentDate,
		status: record.status,
		vceName: record.vceName,
		mrNo: record.referenceNo.startsWith("MR") ? record.referenceNo : "",
		rrNo: record.referenceNo.startsWith("RR") ? record.referenceNo : "",
		lineEntries: [
			createBlankGoodsIssueLineEntry({
				itemCode: "ITEM-001",
				itemName: "Issued inventory item",
				itemCategory: "Supplies",
				issueQuantity: "1.00",
				remainingQuantity: "999.00",
				unitCost: record.totalAmount.toFixed(4),
				amount: record.totalAmount.toFixed(2),
				referenceNo: record.referenceNo,
			}),
		],
	};
}

export function createGoodsIssueRecordFromForm(
	values: GoodsIssueFormValues,
	existingRecord?: GoodsIssueRecord,
): GoodsIssueRecord {
	const totals = calculateGoodsIssueTotals(values.lineEntries);

	return {
		id: existingRecord?.id ?? `gi-${Date.now()}`,
		documentDate: values.documentDate,
		formValues: {
			...values,
			lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
		},
		referenceNo: values.mrNo || values.rrNo || values.icNo || values.joNo,
		status: normalizeGoodsIssueStatus(values.status),
		totalAmount: totals.amount,
		transactionNo: values.transactionNo,
		transactionType: values.transactionType,
		vceName: values.vceName,
	};
}

export function calculateGoodsIssueTotals(
	entries: GoodsIssueLineEntry[],
): GoodsIssueTotals {
	return entries.reduce(
		(summary, entry) => ({
			amount: summary.amount + parseMoneyNumberInput(entry.amount),
			issueQuantity:
				summary.issueQuantity + parseMoneyNumberInput(entry.issueQuantity),
		}),
		{ amount: 0, issueQuantity: 0 },
	);
}

export function getInitialGoodsIssues() {
	return readStoredGoodsIssues() ?? MockGoodsIssues;
}

export function readStoredGoodsIssues() {
	if (typeof window === "undefined") {
		return null;
	}

	const storedRecords = window.localStorage.getItem(GoodsIssueStorageKey);

	if (!storedRecords) {
		return null;
	}

	try {
		const parsedRecords = JSON.parse(storedRecords) as GoodsIssueRecord[];

		return Array.isArray(parsedRecords) ? parsedRecords : null;
	} catch {
		return null;
	}
}

export function writeStoredGoodsIssues(records: GoodsIssueRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(GoodsIssueStorageKey, JSON.stringify(records));
}

export function formatGoodsIssueDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function formatGoodsIssueCurrency(amount: number) {
	return new Intl.NumberFormat("en-PH", {
		currency: "PHP",
		style: "currency",
	}).format(amount);
}

export function formatGoodsIssueAmount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function countGoodsIssuesByStatus(
	records: GoodsIssueRecord[],
	status: GoodsIssueStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function isGoodsIssueActiveStatus(status: GoodsIssueStatus) {
	return status === "Active" || status === "Approved";
}

export function formatGoodsIssuePercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function goodsIssueEntryHasData(entry: GoodsIssueLineEntry) {
	return (
		entry.itemCode.trim() !== "" ||
		entry.itemName.trim() !== "" ||
		entry.referenceNo.trim() !== "" ||
		parseMoneyNumberInput(entry.issueQuantity) > 0 ||
		parseMoneyNumberInput(entry.amount) > 0
	);
}

export function goodsIssueEntryIsComplete(entry: GoodsIssueLineEntry) {
	return (
		entry.itemCode.trim() !== "" &&
		parseMoneyNumberInput(entry.issueQuantity) > 0
	);
}

function normalizeGoodsIssueStatus(value: string): GoodsIssueStatus {
	const statuses: GoodsIssueStatus[] = [
		"Active",
		"Approved",
		"Cancelled",
		"Closed",
		"Disapproved",
		"Draft",
		"Pending",
	];

	return statuses.includes(value as GoodsIssueStatus)
		? (value as GoodsIssueStatus)
		: "Draft";
}
