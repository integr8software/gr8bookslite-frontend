import type {
	PickListFormValues,
	PickListLineEntry,
	PickListRecord,
	PickListSalesOrderCopyRecord,
	PickListStatus,
} from "@/app/src/types/modules/inventory/pick-list/PickListTypes";

export const PickListStorageKey = "gr8books.pick-list.records";

export const PickListClusterOptions = [
	{ name: "1478", value: "1478" },
	{ name: "North Route", value: "North Route" },
	{ name: "South Route", value: "South Route" },
	{ name: "Central Dispatch", value: "Central Dispatch" },
];

export const PickListStatusOptions = [
	{ name: "Draft", value: "Draft" },
	{ name: "For Approval", value: "For Approval" },
	{ name: "Posted", value: "Posted" },
	{ name: "Disapproved", value: "Disapproved" },
	{ name: "Cancelled", value: "Cancelled" },
];

export const PickListSalesOrderCopyRecords: PickListSalesOrderCopyRecord[] = [
	{
		id: "so-001",
		customerCode: "VCE-001",
		customerName: "North Harbor Office Depot",
		documentDate: "2026-07-16",
		referenceNo: "SO-2026-0101",
		remarks: "Sales order for delivery pick list.",
		sourceNo: "SO-2026-0101",
	},
	{
		id: "so-002",
		customerCode: "VCE-002",
		customerName: "Aster Foods Corporation",
		documentDate: "2026-07-14",
		referenceNo: "SO-2026-0098",
		remarks: "North route sales order.",
		sourceNo: "SO-2026-0098",
	},
];

export const MockPickLists: PickListRecord[] = [
	{
		id: "pl-001",
		cluster: "1478",
		deliveryDate: "2026-07-16",
		documentDate: "2026-07-16",
		referenceNo: "SO-2026-0101",
		status: "Posted",
		totalLines: 2,
		transactionNo: "PL-2026-0001",
	},
	{
		id: "pl-002",
		cluster: "North Route",
		deliveryDate: "2026-07-14",
		documentDate: "2026-07-14",
		referenceNo: "SO-2026-0098",
		status: "For Approval",
		totalLines: 1,
		transactionNo: "PL-2026-0002",
	},
	{
		id: "pl-003",
		cluster: "Central Dispatch",
		deliveryDate: "2026-07-12",
		documentDate: "2026-07-12",
		referenceNo: "SO-2026-0093",
		status: "Posted",
		totalLines: 3,
		transactionNo: "PL-2026-0003",
	},
];

export function createBlankPickListLineEntry(
	overrides: Partial<PickListLineEntry> = {},
): PickListLineEntry {
	return {
		id: `pl-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		soNo: "",
		itemCode: "",
		barcode: "",
		itemName: "",
		soQuantity: "0.00",
		plQuantity: "0.00",
		uom: "PCS",
		expirationDate: "",
		lotNo: "",
		color: "",
		brand: "",
		size: "",
		model: "",
		binNo: "",
		...overrides,
	};
}

export function createPickListFormValues(): PickListFormValues {
	const today = new Date().toISOString().slice(0, 10);

	return {
		partyCode: "",
		partyName: "",
		deliveryDate: today,
		driverName: "",
		plateNo: "",
		remarks: "",
		cluster: "1478",
		transactionNo: "PL-2026-0004",
		documentDate: today,
		status: "Draft",
		lineEntries: [createBlankPickListLineEntry()],
	};
}

export function createPickListFormValuesFromRecord(
	record: PickListRecord,
): PickListFormValues {
	if (record.formValues) {
		const defaults = createPickListFormValues();

		return {
			...defaults,
			...record.formValues,
			status: normalizePickListStatus(record.formValues.status),
			lineEntries: record.formValues.lineEntries.map((entry) => ({
				...createBlankPickListLineEntry(),
				...entry,
			})),
		};
	}

	return {
		...createPickListFormValues(),
		cluster: record.cluster,
		deliveryDate: record.deliveryDate,
		documentDate: record.documentDate,
		partyCode: "VCE-001",
		partyName: "North Harbor Office Depot",
		status: normalizePickListStatus(record.status),
		transactionNo: record.transactionNo,
		lineEntries: [
			createBlankPickListLineEntry({
				soNo: record.referenceNo,
				itemCode: "ITEM-001",
				itemName: "Inventory item",
				soQuantity: "0.00",
				plQuantity: "1000.00",
				uom: "PCS",
			}),
		],
	};
}

export function createPickListRecordFromForm(
	values: PickListFormValues,
	existingRecord?: PickListRecord,
): PickListRecord {
	const linesWithData = values.lineEntries.filter(pickListEntryHasData);

	return {
		id: existingRecord?.id ?? `pl-${Date.now()}`,
		cluster: values.cluster,
		deliveryDate: values.deliveryDate,
		documentDate: values.documentDate,
		formValues: {
			...values,
			lineEntries: values.lineEntries.map((entry) => ({ ...entry })),
		},
		referenceNo:
			linesWithData.find((entry) => entry.soNo.trim())?.soNo ?? "",
		status: normalizePickListStatus(values.status),
		totalLines: linesWithData.length,
		transactionNo: values.transactionNo,
	};
}

export function getInitialPickLists() {
	return readStoredPickLists() ?? MockPickLists;
}

export function readStoredPickLists() {
	if (typeof window === "undefined") {
		return null;
	}

	const storedRecords = window.localStorage.getItem(PickListStorageKey);

	if (!storedRecords) {
		return null;
	}

	try {
		const parsedRecords = JSON.parse(storedRecords) as PickListRecord[];

		return Array.isArray(parsedRecords)
			? parsedRecords.map(normalizeStoredPickListRecord)
			: null;
	} catch {
		return null;
	}
}

export function writeStoredPickLists(records: PickListRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(PickListStorageKey, JSON.stringify(records));
}

export function formatPickListDate(value: string) {
	return new Intl.DateTimeFormat("en-PH", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(new Date(value));
}

export function countPickListsByStatus(
	records: PickListRecord[],
	status: PickListStatus,
) {
	return records.filter((record) => record.status === status).length;
}

export function formatPickListPercentage(value: number, total: number) {
	if (total === 0) {
		return "0.00% of total";
	}

	return `${((value / total) * 100).toFixed(2)}% of total`;
}

export function pickListEntryHasData(entry: PickListLineEntry) {
	return (
		entry.soNo.trim() !== "" ||
		entry.itemCode.trim() !== "" ||
		entry.barcode.trim() !== "" ||
		entry.itemName.trim() !== "" ||
		entry.lotNo.trim() !== "" ||
		entry.binNo.trim() !== "" ||
		Number(entry.soQuantity.replace(/,/g, "")) > 0 ||
		Number(entry.plQuantity.replace(/,/g, "")) > 0
	);
}

export function pickListEntryIsComplete(entry: PickListLineEntry) {
	return entry.itemCode.trim() !== "" && entry.itemName.trim() !== "";
}

function normalizePickListStatus(value: string): PickListStatus {
	if (value === "Active" || value === "Approved" || value === "Closed") {
		return "Posted";
	}

	if (value === "Pending") {
		return "For Approval";
	}

	const statuses: PickListStatus[] = [
		"Cancelled",
		"Disapproved",
		"Draft",
		"For Approval",
		"Posted",
	];

	return statuses.includes(value as PickListStatus)
		? (value as PickListStatus)
		: "Draft";
}

function normalizeStoredPickListRecord(record: PickListRecord): PickListRecord {
	const status = normalizePickListStatus(record.status);

	return {
		...record,
		formValues: record.formValues
			? {
					...record.formValues,
					status: normalizePickListStatus(record.formValues.status),
				}
			: record.formValues,
		status,
	};
}
