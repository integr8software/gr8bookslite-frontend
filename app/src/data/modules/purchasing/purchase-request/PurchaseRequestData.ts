import { PurchaseRequestStorageKey } from "@/app/src/constants/modules/purchasing/purchase-request/PurchaseRequestConstants";
import type {
	PurchaseRequestFormValues,
	PurchaseRequestItem,
	PurchaseRequestRecord,
} from "@/app/src/types/modules/purchasing/purchase-request/PurchaseRequestTypes";

const DefaultPurchaseRequestPrintHeader = {
	companyAddress:
		"Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District",
	companyName: "Your Company Name Here",
	logoText: "QUANTUM EDGE",
	telephoneNo: "0967-237-4514",
	vatRegTin: "000-000-000",
};

export const purchaseRequestSeedRecords: PurchaseRequestRecord[] = [
	{
		id: "pr-000292",
		...DefaultPurchaseRequestPrintHeader,
		vceCode: "RMBT0001",
		vceName: "RMBT Corporation-yes",
		purchaseType: "Goods",
		transNo: "000292",
		prDate: "2026-03-24",
		status: "Closed",
		currency: "PHP",
		exchangeRate: 1,
		bomNo: "",
		projectCode: "",
		projectName: "",
		vendorAddress: "",
		remarks: "",
		forDepartment: "",
		preparedBy: "",
		approvedBy: "",
		items: [
			{
				id: "pr-000292-item-1",
				itemCode: "IM0020",
				barcode: "",
				description: "Topcoat Matte",
				uom: "PC",
				quantity: 10,
				lotNo: "",
				expiryDate: "1900-01-01",
				cost: 102831,
				responsibilityCenter: "",
			},
		],
	},
];

export const emptyPurchaseRequestItem: PurchaseRequestItem = {
	id: "draft-item",
	itemCode: "",
	barcode: "",
	description: "",
	uom: "PC",
	quantity: 1,
	lotNo: "",
	expiryDate: "",
	cost: 0,
	responsibilityCenter: "",
};

export function createPurchaseRequestFormValues(
	record?: PurchaseRequestRecord,
): PurchaseRequestFormValues {
	if (record) {
		return {
			companyAddress:
				record.companyAddress ?? DefaultPurchaseRequestPrintHeader.companyAddress,
			companyName:
				record.companyName ?? DefaultPurchaseRequestPrintHeader.companyName,
			logoText: record.logoText ?? DefaultPurchaseRequestPrintHeader.logoText,
			telephoneNo:
				record.telephoneNo ?? DefaultPurchaseRequestPrintHeader.telephoneNo,
			vatRegTin: record.vatRegTin ?? DefaultPurchaseRequestPrintHeader.vatRegTin,
			vceCode: record.vceCode,
			vceName: record.vceName,
			purchaseType: record.purchaseType,
			transNo: record.transNo,
			prDate: record.prDate,
			status: record.status,
			currency: record.currency,
			exchangeRate: record.exchangeRate,
			bomNo: record.bomNo,
			projectCode: record.projectCode,
			projectName: record.projectName,
			vendorAddress: record.vendorAddress,
			remarks: record.remarks,
			forDepartment: record.forDepartment,
			preparedBy: record.preparedBy,
			approvedBy: record.approvedBy,
			items: record.items.map((item) => ({ ...item })),
		};
	}

	return {
		...DefaultPurchaseRequestPrintHeader,
		vceCode: "",
		vceName: "",
		purchaseType: "Goods",
		transNo: createNextTransNo(purchaseRequestSeedRecords),
		prDate: new Date().toISOString().slice(0, 10),
		status: "Draft",
		currency: "PHP",
		exchangeRate: 1,
		bomNo: "",
		projectCode: "",
		projectName: "",
		vendorAddress: "",
		remarks: "",
		forDepartment: "",
		preparedBy: "",
		approvedBy: "",
		items: [{ ...emptyPurchaseRequestItem, id: createPurchaseRequestId("item") }],
	};
}

export function createPurchaseRequestRecord(
	values: PurchaseRequestFormValues,
	id = createPurchaseRequestId("pr"),
): PurchaseRequestRecord {
	return {
		id,
		...values,
		items: values.items.map((item) => ({
			...item,
			id: item.id || createPurchaseRequestId("item"),
			quantity: Number(item.quantity) || 0,
			cost: Number(item.cost) || 0,
		})),
	};
}

export function getPurchaseRequestTotal(record: Pick<PurchaseRequestRecord, "items">) {
	return record.items.reduce(
		(total, item) => total + getPurchaseRequestItemAmount(item),
		0,
	);
}

export function getPurchaseRequestItemAmount(item: PurchaseRequestItem) {
	return (Number(item.quantity) || 0) * (Number(item.cost) || 0);
}

export function formatPurchaseRequestCurrency(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatPurchaseRequestDate(value: string) {
	if (!value) {
		return "";
	}

	const [year, month, day] = value.split("-");

	if (!year || !month || !day) {
		return value;
	}

	return `${month}/${day}/${year}`;
}

export function loadPurchaseRequests() {
	if (typeof window === "undefined") {
		return purchaseRequestSeedRecords;
	}

	try {
		const stored = window.localStorage.getItem(PurchaseRequestStorageKey);

		if (!stored) {
			return purchaseRequestSeedRecords;
		}

		const parsed = JSON.parse(stored) as PurchaseRequestRecord[];

		return Array.isArray(parsed) && parsed.length > 0
			? parsed
			: purchaseRequestSeedRecords;
	} catch {
		return purchaseRequestSeedRecords;
	}
}

export function savePurchaseRequests(records: PurchaseRequestRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(PurchaseRequestStorageKey, JSON.stringify(records));
}

export function createNextTransNo(records: PurchaseRequestRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const numeric = Number.parseInt(record.transNo, 10);

			return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
		}, 291) + 1;

	return nextNumber.toString().padStart(6, "0");
}

export function createPurchaseRequestId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}
