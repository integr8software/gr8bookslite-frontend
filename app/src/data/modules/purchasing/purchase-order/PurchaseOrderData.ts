import { PurchaseOrderStorageKey } from "@/app/src/constants/modules/purchasing/purchase-order/PurchaseOrderConstants";
import type {
	PurchaseOrderAccountingEntry,
	PurchaseOrderFormValues,
	PurchaseOrderItem,
	PurchaseOrderRecord,
	PurchaseOrderStatus,
} from "@/app/src/types/modules/purchasing/purchase-order/PurchaseOrderTypes";

export const purchaseOrderSeedRecords: PurchaseOrderRecord[] = [
	{
		id: "po-0001",
		vceCode: "VCE-001",
		vceName: "North Harbor Office Depot",
		purchaseType: "Goods",
		transNo: "PO-2026-0001",
		documentDate: "2026-07-18",
		prNo: "PR-2026-0001",
		status: "Draft",
		currency: "PHP",
		exchangeRate: 1,
		address: "",
		contactNo: "",
		emailAddress: "",
		deliveryDate: "2026-07-18",
		termsOfPayment: "Net 30",
		remarks: "",
		discountAmount: 0,
		vatAmount: 0,
		projectCode: "",
		projectName: "",
		importationNo: "",
		partialPayment: false,
		accountingEntries: createPurchaseOrderAccountingEntries({
			partyCode: "VCE-001",
			partyName: "North Harbor Office Depot",
			refNo: "PO-2026-0001",
		}),
		items: [
			{
				id: "po-0001-item-1",
				itemCode: "ITEM-001",
				barcode: "",
				itemName: "Office supplies",
				itemCategory: "",
				color: "",
				brand: "",
				size: "",
				model: "",
				quantity: 1,
				uom: "PC",
				expiryDate: "",
				freightCost: 0,
				rateDelivery: 0,
				cost: 0,
				vatAmount: 0,
				ewt: "",
				discountAmount: 0,
				vatable: "False",
				vatInclusive: "False",
				vatType: "",
				responsibilityCenter: "",
				budgetCode: "",
				prQuantity: 0,
				linePrNo: "",
				canvassNo: "",
			},
		],
	},
];

export const emptyPurchaseOrderItem: PurchaseOrderItem = {
	id: "draft-item",
	itemCode: "",
	barcode: "",
	itemName: "",
	itemCategory: "",
	color: "",
	brand: "",
	size: "",
	model: "",
	quantity: 0,
	uom: "PC",
	expiryDate: "",
	freightCost: 0,
	rateDelivery: 0,
	cost: 0,
	vatAmount: 0,
	ewt: "",
	discountAmount: 0,
	vatable: "False",
	vatInclusive: "False",
	vatType: "",
	responsibilityCenter: "",
	budgetCode: "",
	prQuantity: 0,
	linePrNo: "",
	canvassNo: "",
};

export function createBlankPurchaseOrderAccountingEntry(): PurchaseOrderAccountingEntry {
	return createPurchaseOrderAccountingEntry();
}

export function createPurchaseOrderFormValues(
	record?: PurchaseOrderRecord,
): PurchaseOrderFormValues {
	if (record) {
		const normalizedRecord = normalizePurchaseOrderRecordDefaults(record);

		return {
			...normalizedRecord,
			accountingEntries: normalizedRecord.accountingEntries.map((entry) => ({
				...entry,
			})),
			items: normalizedRecord.items.map((item) =>
				normalizePurchaseOrderItemDefaults(item),
			),
		};
	}

	return {
		vceCode: "",
		vceName: "",
		purchaseType: "Goods",
		transNo: createNextPurchaseOrderTransNo(purchaseOrderSeedRecords),
		documentDate: new Date().toISOString().slice(0, 10),
		prNo: "",
		status: "Draft",
		currency: "PHP",
		exchangeRate: 1,
		address: "",
		contactNo: "",
		emailAddress: "",
		deliveryDate: new Date().toISOString().slice(0, 10),
		termsOfPayment: "",
		remarks: "",
		discountAmount: 0,
		vatAmount: 0,
		projectCode: "",
		projectName: "",
		importationNo: "",
		partialPayment: false,
		accountingEntries: createPurchaseOrderAccountingEntries(),
		items: [createBlankPurchaseOrderItem()],
	};
}

export function createPurchaseOrderRecord(
	values: PurchaseOrderFormValues,
	id = createPurchaseOrderId("po"),
): PurchaseOrderRecord {
	return {
		id,
		...values,
		status: normalizePurchaseOrderStatus(values.status),
		accountingEntries: (
			values.accountingEntries ??
			createPurchaseOrderAccountingEntries({
				partyCode: values.vceCode,
				partyName: values.vceName,
				refNo: values.transNo,
			})
		).map((entry) =>
			createPurchaseOrderAccountingEntry({
				...entry,
				debit: Number(entry.debit) || 0,
				credit: Number(entry.credit) || 0,
			}),
		),
		items: values.items.map((item) => ({
			...normalizePurchaseOrderItemDefaults(item),
			id: item.id || createPurchaseOrderId("item"),
			quantity: Number(item.quantity) || 0,
			freightCost: Number(item.freightCost) || 0,
			rateDelivery: Number(item.rateDelivery) || 0,
			cost: Number(item.cost) || 0,
			vatAmount: Number(item.vatAmount) || 0,
			discountAmount: Number(item.discountAmount) || 0,
			prQuantity: Number(item.prQuantity) || 0,
		})),
	};
}

function normalizePurchaseOrderItemDefaults(
	item: Partial<PurchaseOrderItem>,
): PurchaseOrderItem {
	return {
		...emptyPurchaseOrderItem,
		...item,
		color: item.color ?? "",
		brand: item.brand ?? "",
		size: item.size ?? "",
		model: item.model ?? "",
		rateDelivery: item.rateDelivery ?? 0,
		linePrNo: item.linePrNo ?? "",
		canvassNo: item.canvassNo ?? "",
	};
}

export function createBlankPurchaseOrderItem(): PurchaseOrderItem {
	return {
		...emptyPurchaseOrderItem,
		id: createPurchaseOrderId("item"),
	};
}

export function getPurchaseOrderItemGrossAmount(item: PurchaseOrderItem) {
	return (Number(item.quantity) || 0) * (Number(item.cost) || 0);
}

export function getPurchaseOrderItemNetAmount(item: PurchaseOrderItem) {
	return (
		getPurchaseOrderItemGrossAmount(item) +
		(Number(item.freightCost) || 0) +
		(Number(item.rateDelivery) || 0) +
		(Number(item.vatAmount) || 0) -
		(Number(item.discountAmount) || 0)
	);
}

export function getPurchaseOrderTotals(
	record: Pick<PurchaseOrderRecord, "discountAmount" | "items" | "vatAmount">,
) {
	const grossAmount = record.items.reduce(
		(total, item) => total + getPurchaseOrderItemGrossAmount(item),
		0,
	);
	const discountAmount =
		Number(record.discountAmount) ||
		record.items.reduce(
			(total, item) => total + (Number(item.discountAmount) || 0),
			0,
		);
	const vatAmount =
		Number(record.vatAmount) ||
		record.items.reduce(
			(total, item) => total + (Number(item.vatAmount) || 0),
			0,
		);

	return {
		discountAmount,
		grossAmount,
		netAmount: grossAmount + vatAmount - discountAmount,
		vatAmount,
	};
}

export function getPurchaseOrderParty(
	record: Pick<PurchaseOrderRecord, "vceCode" | "vceName">,
) {
	return {
		partyCode: record.vceCode,
		partyName: record.vceName,
	};
}

export function formatPurchaseOrderAmount(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 4,
	});
}

export function formatPurchaseOrderDate(value: string) {
	if (!value) return "";

	const [year, month, day] = value.split("-");

	return year && month && day ? `${month}/${day}/${year}` : value;
}

export function loadPurchaseOrders() {
	if (typeof window === "undefined") return purchaseOrderSeedRecords;

	try {
		const stored = window.localStorage.getItem(PurchaseOrderStorageKey);

		if (!stored) return purchaseOrderSeedRecords;

		const parsed = JSON.parse(stored) as PurchaseOrderRecord[];

		return Array.isArray(parsed) && parsed.length > 0
			? parsed.map(normalizePurchaseOrderRecordDefaults)
			: purchaseOrderSeedRecords;
	} catch {
		return purchaseOrderSeedRecords;
	}
}

function normalizePurchaseOrderRecordDefaults(
	record: Partial<PurchaseOrderRecord>,
): PurchaseOrderRecord {
	const transNo = record.transNo ?? createNextPurchaseOrderTransNo(purchaseOrderSeedRecords);

	return {
		id: record.id ?? createPurchaseOrderId("po"),
		vceCode: record.vceCode ?? "",
		vceName: record.vceName ?? "",
		purchaseType: record.purchaseType ?? "Goods",
		transNo,
		documentDate: record.documentDate ?? new Date().toISOString().slice(0, 10),
		prNo: record.prNo ?? "",
		status: normalizePurchaseOrderStatus(record.status),
		currency: record.currency ?? "PHP",
		exchangeRate: Number(record.exchangeRate) || 1,
		address: record.address ?? "",
		contactNo: record.contactNo ?? "",
		emailAddress: record.emailAddress ?? "",
		deliveryDate: record.deliveryDate ?? new Date().toISOString().slice(0, 10),
		termsOfPayment: record.termsOfPayment ?? "",
		remarks: record.remarks ?? "",
		discountAmount: Number(record.discountAmount) || 0,
		vatAmount: Number(record.vatAmount) || 0,
		projectCode: record.projectCode ?? "",
		projectName: record.projectName ?? "",
		importationNo: record.importationNo ?? "",
		partialPayment: Boolean(record.partialPayment),
		accountingEntries:
			record.accountingEntries?.map((entry) =>
				createPurchaseOrderAccountingEntry({
					...entry,
					debit: Number(entry.debit) || 0,
					credit: Number(entry.credit) || 0,
				}),
			) ??
			createPurchaseOrderAccountingEntries({
				partyCode: record.vceCode ?? "",
				partyName: record.vceName ?? "",
				refNo: transNo,
			}),
		items: (record.items ?? [createBlankPurchaseOrderItem()]).map(
			normalizePurchaseOrderItemDefaults,
		),
	};
}

function createPurchaseOrderAccountingEntries({
	partyCode = "",
	partyName = "",
	refNo = "",
}: {
	partyCode?: string;
	partyName?: string;
	refNo?: string;
} = {}) {
	return [
		createPurchaseOrderAccountingEntry({
			accountTitle: "Inventory",
			debit: 0,
			particulars: "Purchase order accrual",
			refNo,
		}),
		createPurchaseOrderAccountingEntry({
			accountTitle: "Accounts Payable",
			credit: 0,
			partyCode,
			partyName,
			particulars: "Purchase order accrual",
			refNo,
		}),
	];
}

function createPurchaseOrderAccountingEntry(
	entry: Partial<PurchaseOrderAccountingEntry> = {},
): PurchaseOrderAccountingEntry {
	return {
		id: createPurchaseOrderId("accounting"),
		accountCode: "",
		accountTitle: "",
		debit: 0,
		credit: 0,
		partyCode: "",
		partyName: "",
		particulars: "",
		vatType: "",
		atcCode: "",
		responsibilityCenter: "",
		refNo: "",
		...entry,
	};
}

function normalizePurchaseOrderStatus(status: unknown): PurchaseOrderStatus {
	const value = String(status ?? "");

	if (
		value === "Draft" ||
		value === "For Approval" ||
		value === "Posted" ||
		value === "Disapproved" ||
		value === "Cancelled"
	) {
		return value;
	}

	if (value === "Open") return "For Approval";
	if (value === "Approved" || value === "Closed") return "Posted";

	return "Draft";
}

export function savePurchaseOrders(records: PurchaseOrderRecord[]) {
	if (typeof window === "undefined") return;

	window.localStorage.setItem(PurchaseOrderStorageKey, JSON.stringify(records));
}

export function createNextPurchaseOrderTransNo(records: PurchaseOrderRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const numeric = Number.parseInt(record.transNo.replace(/\D/g, ""), 10);

			return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
		}, 0) + 1;

	return `PO-2026-${nextNumber.toString().padStart(4, "0")}`;
}

export function createPurchaseOrderId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}
