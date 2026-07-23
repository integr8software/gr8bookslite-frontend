import { SalesQuotationStorageKey } from "@/app/src/constants/modules/sales/sales-quotation/SalesQuotationConstants";
import { FormatTinNumber } from "@/app/src/data/shared/tax/TaxData";
import type {
	SalesQuotationFormValues,
	SalesQuotationItem,
	SalesQuotationRecord,
} from "@/app/src/types/modules/sales/sales-quotation/SalesQuotationTypes";

const DefaultSalesQuotationPrintHeader = {
	companyAddress:
		"Abc, 123, Sample, Malamig, City Of Mandaluyong, Ncr, Second District",
	companyName: "Your Company Name Here",
	logoFileName: "",
	logoImageUrl: "",
	telephoneNo: "0967-237-4514",
	vatRegTin: "000-000-000-000",
};

export const salesQuotationSeedRecords: SalesQuotationRecord[] = [
	{
		id: "pr-000292",
		...DefaultSalesQuotationPrintHeader,
		partyCode: "RMBT0001",
		partyName: "RMBT Corporation-yes",
		transNo: "000292",
		prDate: "2026-03-24",
		status: "Closed",
		currency: "PHP",
		exchangeRate: 1,
		bomNo: "",
		projectCode: "",
		projectName: "",
		partyAddress: "",
		remarks: "",
		forDepartment: "",
		preparedBy: "",
		preparedByLabel: "Prepared by",
		preparedBySignatureFileName: "",
		preparedBySignatureImageUrl: "",
		approvedBy: "",
		approvedByLabel: "Approved by",
		approvedBySignatureFileName: "",
		approvedBySignatureImageUrl: "",
		items: [
			{
				id: "pr-000292-item-1",
				itemCode: "IM0020",
				barcode: "",
				itemName: "Topcoat Matte",
				itemCategory: "",
				quantity: 10,
				uom: "PC",
				itemPrice: 102831,
				vatAmount: 0,
				ewtAmount: 0,
				discountAmount: 0,
				vatable: "False",
				vatInclusive: "False",
				vatType: "",
				responsibilityCenter: "",
			},
		],
	},
];

export const emptySalesQuotationItem: SalesQuotationItem = {
	id: "draft-item",
	itemCode: "",
	barcode: "",
	itemName: "",
	itemCategory: "",
	quantity: 1,
	uom: "PC",
	itemPrice: 0,
	vatAmount: 0,
	ewtAmount: 0,
	discountAmount: 0,
	vatable: "False",
	vatInclusive: "False",
	vatType: "",
	responsibilityCenter: "",
};

export function createSalesQuotationFormValues(
	record?: SalesQuotationRecord,
): SalesQuotationFormValues {
	if (record) {
		return {
			companyAddress:
				record.companyAddress ?? DefaultSalesQuotationPrintHeader.companyAddress,
			companyName:
				record.companyName ?? DefaultSalesQuotationPrintHeader.companyName,
			logoFileName:
				record.logoFileName ??
				DefaultSalesQuotationPrintHeader.logoFileName,
			logoImageUrl:
				record.logoImageUrl ??
				DefaultSalesQuotationPrintHeader.logoImageUrl,
			telephoneNo:
				record.telephoneNo ?? DefaultSalesQuotationPrintHeader.telephoneNo,
			vatRegTin: record.vatRegTin ?? DefaultSalesQuotationPrintHeader.vatRegTin,
			partyCode: record.partyCode,
			partyName: record.partyName,
			transNo: record.transNo,
			prDate: record.prDate,
			status: record.status,
			currency: record.currency,
			exchangeRate: record.exchangeRate,
			bomNo: record.bomNo,
			projectCode: record.projectCode,
			projectName: record.projectName,
			partyAddress: record.partyAddress,
			remarks: record.remarks,
			forDepartment: record.forDepartment,
			preparedBy: record.preparedBy,
			preparedByLabel: record.preparedByLabel ?? "Prepared by",
			preparedBySignatureFileName: record.preparedBySignatureFileName ?? "",
			preparedBySignatureImageUrl: record.preparedBySignatureImageUrl ?? "",
			approvedBy: record.approvedBy,
			approvedByLabel: record.approvedByLabel ?? "Approved by",
			approvedBySignatureFileName: record.approvedBySignatureFileName ?? "",
			approvedBySignatureImageUrl: record.approvedBySignatureImageUrl ?? "",
			items: record.items.map((item) => ({ ...item })),
		};
	}

	return {
		...DefaultSalesQuotationPrintHeader,
		partyCode: "",
		partyName: "",
		transNo: createNextTransNo(salesQuotationSeedRecords),
		prDate: new Date().toISOString().slice(0, 10),
		status: "Draft",
		currency: "PHP",
		exchangeRate: 1,
		bomNo: "",
		projectCode: "",
		projectName: "",
		partyAddress: "",
		remarks: "",
		forDepartment: "",
		preparedBy: "",
		preparedByLabel: "Prepared by",
		preparedBySignatureFileName: "",
		preparedBySignatureImageUrl: "",
		approvedBy: "",
		approvedByLabel: "Approved by",
		approvedBySignatureFileName: "",
		approvedBySignatureImageUrl: "",
		items: [{ ...emptySalesQuotationItem, id: createSalesQuotationId("item") }],
	};
}

export function createSalesQuotationRecord(
	values: SalesQuotationFormValues,
	id = createSalesQuotationId("pr"),
): SalesQuotationRecord {
	return {
		id,
		...values,
		vatRegTin: FormatTinNumber(values.vatRegTin),
		items: values.items.map((item) => ({
			...item,
			id: item.id || createSalesQuotationId("item"),
			quantity: Number(item.quantity) || 0,
			itemPrice: Number(item.itemPrice) || 0,
			vatAmount: getSalesQuotationItemVatAmount(item),
			ewtAmount: Number(item.ewtAmount) || 0,
			discountAmount: Number(item.discountAmount) || 0,
		})),
	};
}

export function getSalesQuotationTotal(record: Pick<SalesQuotationRecord, "items">) {
	return getSalesQuotationTotals(record).netAmount;
}

export function getSalesQuotationItemAmount(item: SalesQuotationItem) {
	return (Number(item.quantity) || 0) * (Number(item.itemPrice) || 0);
}

export function getSalesQuotationItemVatAmount(item: SalesQuotationItem) {
	return item.vatable === "True"
		? getSalesQuotationItemAmount(item) * 0.12
		: 0;
}

export function getSalesQuotationItemNetAmount(item: SalesQuotationItem) {
	return (
		getSalesQuotationItemAmount(item) +
		getSalesQuotationItemVatAmount(item) -
		(Number(item.ewtAmount) || 0) -
		(Number(item.discountAmount) || 0)
	);
}

export function getSalesQuotationTotals(
	record: Pick<SalesQuotationRecord, "items">,
) {
	return record.items.reduce(
		(totals, item) => ({
			grossAmount: totals.grossAmount + getSalesQuotationItemAmount(item),
			vatAmount: totals.vatAmount + getSalesQuotationItemVatAmount(item),
			ewtAmount: totals.ewtAmount + (Number(item.ewtAmount) || 0),
			discountAmount:
				totals.discountAmount + (Number(item.discountAmount) || 0),
			netAmount: totals.netAmount + getSalesQuotationItemNetAmount(item),
		}),
		{
			grossAmount: 0,
			vatAmount: 0,
			ewtAmount: 0,
			discountAmount: 0,
			netAmount: 0,
		},
	);
}

export function formatSalesQuotationCurrency(amount: number) {
	return amount.toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

export function formatSalesQuotationMoney(amount: number, currency: string) {
	const symbol = getSalesQuotationCurrencySymbol(currency);

	return `${symbol}${formatSalesQuotationCurrency(amount)}`;
}

function getSalesQuotationCurrencySymbol(currency: string) {
	const symbols: Record<string, string> = {
		EUR: "â‚¬",
		JPY: "Â¥",
		PHP: "â‚±",
		USD: "$",
	};

	if (symbols[currency]) {
		return symbols[currency];
	}

	switch (currency) {
		case "PHP":
			return "â‚±";
		case "USD":
			return "$";
		case "JPY":
			return "Â¥";
		case "EUR":
			return "â‚¬";
		default:
			return currency ? `${currency} ` : "";
	}
}

export function formatSalesQuotationDate(value: string) {
	if (!value) {
		return "";
	}

	const [year, month, day] = value.split("-");

	if (!year || !month || !day) {
		return value;
	}

	return `${month}/${day}/${year}`;
}

export function loadSalesQuotations() {
	if (typeof window === "undefined") {
		return salesQuotationSeedRecords;
	}

	try {
		const stored = window.localStorage.getItem(SalesQuotationStorageKey);

		if (!stored) {
			return salesQuotationSeedRecords;
		}

		const parsed = JSON.parse(stored) as SalesQuotationRecord[];

		const records =
			Array.isArray(parsed) && parsed.length > 0
				? parsed.map(normalizeSalesQuotationRecord)
				: salesQuotationSeedRecords;

		return records;
	} catch {
		return salesQuotationSeedRecords;
	}
}

function normalizeSalesQuotationRecord(
	record: SalesQuotationRecord,
): SalesQuotationRecord {
	return {
		...record,
		items: record.items.map((item) => {
			const legacyItem = item as SalesQuotationItem & {
				description?: string;
			};
			const normalizedItem: SalesQuotationItem = {
				...emptySalesQuotationItem,
				...legacyItem,
				itemName: legacyItem.itemName ?? legacyItem.description ?? "",
				itemCategory: legacyItem.itemCategory ?? "",
				ewtAmount: Number(legacyItem.ewtAmount) || 0,
				discountAmount: Number(legacyItem.discountAmount) || 0,
				vatable: legacyItem.vatable === "True" ? "True" : "False",
				vatInclusive:
					legacyItem.vatInclusive === "True" ? "True" : "False",
				vatType: legacyItem.vatType ?? "",
			};

			return {
				...normalizedItem,
				vatAmount: getSalesQuotationItemVatAmount(normalizedItem),
			};
		}),
	};
}

export function saveSalesQuotations(records: SalesQuotationRecord[]) {
	if (typeof window === "undefined") {
		return;
	}

	window.localStorage.setItem(SalesQuotationStorageKey, JSON.stringify(records));
}

export function createNextTransNo(records: SalesQuotationRecord[]) {
	const nextNumber =
		records.reduce((highest, record) => {
			const numeric = Number.parseInt(record.transNo, 10);

			return Number.isFinite(numeric) ? Math.max(highest, numeric) : highest;
		}, 291) + 1;

	return nextNumber.toString().padStart(6, "0");
}

export function createSalesQuotationId(prefix: string) {
	return `${prefix}-${Date.now().toString(36)}-${Math.random()
		.toString(36)
		.slice(2, 8)}`;
}
