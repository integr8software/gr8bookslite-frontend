import { SalesOrderStorageKey } from "@/app/src/constants/modules/sales/sales-order/SalesOrderConstants";
import {
	createSalesQuotationFormValues,
	createSalesQuotationId,
} from "@/app/src/data/modules/sales/sales-quotation/SalesQuotationData";
import type {
	SalesOrderFormValues,
	SalesOrderRecord,
} from "@/app/src/types/modules/sales/sales-order/SalesOrderTypes";

export function createSalesOrderFormValues(
	record?: SalesOrderRecord,
): SalesOrderFormValues {
	return {
		...createSalesQuotationFormValues(record),
		contactNo: record?.contactNo ?? "",
		contactPerson: record?.contactPerson ?? "",
		referenceNo: record?.referenceNo ?? "",
		transNo: record?.transNo ?? createNextSalesOrderNo(loadSalesOrders()),
	};
}

export function createSalesOrderRecord(
	values: SalesOrderFormValues,
	id = createSalesQuotationId("so"),
): SalesOrderRecord {
	return { ...values, id };
}

export function loadSalesOrders(): SalesOrderRecord[] {
	if (typeof window === "undefined") return [];

	try {
		const stored = window.localStorage.getItem(SalesOrderStorageKey);
		return stored ? (JSON.parse(stored) as SalesOrderRecord[]) : [];
	} catch {
		return [];
	}
}

export function saveSalesOrders(records: SalesOrderRecord[]) {
	if (typeof window !== "undefined") {
		window.localStorage.setItem(SalesOrderStorageKey, JSON.stringify(records));
	}
}

function createNextSalesOrderNo(records: SalesOrderRecord[]) {
	const nextNumber = records.reduce((highest, record) => {
		const numeric = Number.parseInt(record.transNo.replace(/^SO-/, ""), 10);
		return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
	}, 0) + 1;

	return `SO-${nextNumber.toString().padStart(6, "0")}`;
}
