import { CanvassFormStorageKey } from "@/app/src/constants/modules/purchasing/canvass-form/CanvassFormConstants";
import type {
	CanvassFormItem,
	CanvassFormRecord,
	CanvassFormValues,
} from "@/app/src/types/modules/purchasing/canvass-form/CanvassFormTypes";

export const canvassFormSeedRecords: CanvassFormRecord[] = [
	{
		id: "cf-0001",
		currency: "PHP",
		exchangeRate: 1,
		purchaseType: "Goods",
		requestedBy: "Purchasing Team",
		responsibilityCenter: "",
		requiredBefore: "2026-07-18",
		remarks: "",
		transNo: "CF-2026-0001",
		documentDate: "2026-07-18",
		status: "Draft",
		items: [createBlankCanvassFormItem()],
	},
];

export function createBlankCanvassFormItem(): CanvassFormItem {
	return {
		id: createCanvassFormId("item"),
		itemCode: "",
		barcode: "",
		description: "",
		uom: "PC",
		quantity: 0,
		responsibilityCenter: "",
		supplierCode1: "",
		supplierName1: "",
		unitCost1: 0,
		supplierCode2: "",
		supplierName2: "",
		unitCost2: 0,
		supplierCode3: "",
		supplierName3: "",
		unitCost3: 0,
		supplierCode4: "",
		supplierName4: "",
		unitCost4: 0,
		selectedSupplier: "",
		totalCost: 0,
	};
}

export function createCanvassFormValues(record?: CanvassFormRecord): CanvassFormValues {
	if (record) {
		return { ...record, items: record.items.map((item) => ({ ...item })) };
	}

	return {
		currency: "PHP",
		exchangeRate: 1,
		purchaseType: "Goods",
		requestedBy: "",
		responsibilityCenter: "",
		requiredBefore: new Date().toISOString().slice(0, 10),
		remarks: "",
		transNo: createNextCanvassFormTransNo(canvassFormSeedRecords),
		documentDate: new Date().toISOString().slice(0, 10),
		status: "Draft",
		items: [createBlankCanvassFormItem()],
	};
}

export function createCanvassFormRecord(
	values: CanvassFormValues,
	id = createCanvassFormId("cf"),
): CanvassFormRecord {
	return {
		id,
		...values,
		items: values.items.map((item) => normalizeCanvassFormItem(item)),
	};
}

export function normalizeCanvassFormItem(item: CanvassFormItem): CanvassFormItem {
	const selectedCost = getSelectedSupplierCost(item);

	return {
		...item,
		quantity: Number(item.quantity) || 0,
		unitCost1: Number(item.unitCost1) || 0,
		unitCost2: Number(item.unitCost2) || 0,
		unitCost3: Number(item.unitCost3) || 0,
		unitCost4: Number(item.unitCost4) || 0,
		totalCost: selectedCost * (Number(item.quantity) || 0),
	};
}

export function getSelectedSupplierCost(item: CanvassFormItem) {
	if (item.selectedSupplier === item.supplierName2 || item.selectedSupplier === item.supplierCode2) {
		return Number(item.unitCost2) || 0;
	}
	if (item.selectedSupplier === item.supplierName3 || item.selectedSupplier === item.supplierCode3) {
		return Number(item.unitCost3) || 0;
	}
	if (item.selectedSupplier === item.supplierName4 || item.selectedSupplier === item.supplierCode4) {
		return Number(item.unitCost4) || 0;
	}

	return Number(item.unitCost1) || 0;
}

export function getCanvassFormTotal(values: Pick<CanvassFormRecord, "items">) {
	return values.items.reduce((total, item) => total + normalizeCanvassFormItem(item).totalCost, 0);
}

export function formatCanvassFormAmount(value: number) {
	return value.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatCanvassFormDate(value: string) {
	if (!value) return "";
	const [year, month, day] = value.split("-");
	return year && month && day ? `${month}/${day}/${year}` : value;
}

export function loadCanvassForms() {
	if (typeof window === "undefined") return canvassFormSeedRecords;

	try {
		const stored = window.localStorage.getItem(CanvassFormStorageKey);
		if (!stored) return canvassFormSeedRecords;
		const parsed = JSON.parse(stored) as CanvassFormRecord[];
		return Array.isArray(parsed) && parsed.length > 0 ? parsed : canvassFormSeedRecords;
	} catch {
		return canvassFormSeedRecords;
	}
}

export function saveCanvassForms(records: CanvassFormRecord[]) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(CanvassFormStorageKey, JSON.stringify(records));
}

export function createNextCanvassFormTransNo(records: CanvassFormRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const numeric = Number.parseInt(record.transNo.replace(/\D/g, ""), 10);
			return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
		}, 0) + 1;

	return `CF-2026-${nextNumber.toString().padStart(4, "0")}`;
}

export function createCanvassFormId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}
