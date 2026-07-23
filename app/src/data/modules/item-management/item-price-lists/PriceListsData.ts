import type {
	PriceListFormValues,
	PriceListRecord,
} from "@/app/src/types/modules/item-management/item-price-lists/PriceListsTypes";

export const MockPriceLists: PriceListRecord[] = [
	{
		id: "price-list-retail",
		code: "PL-001",
		name: "Retail",
		customerGroup: "Default customer price",
		currencyCode: "PHP",
		status: "Active",
	},
	{
		id: "price-list-wholesale",
		code: "PL-002",
		name: "Wholesale",
		customerGroup: "Volume buyer price",
		currencyCode: "PHP",
		status: "Active",
	},
	{
		id: "price-list-vip",
		code: "PL-003",
		name: "VIP",
		customerGroup: "Preferred account price",
		currencyCode: "PHP",
		status: "Inactive",
	},
];

export function createPriceListFormValues(
	record?: PriceListRecord,
): PriceListFormValues {
	return {
		code: record?.code ?? "",
		name: record?.name ?? "",
		customerGroup: record?.customerGroup ?? "",
		currencyCode: record?.currencyCode ?? "PHP",
		status: record?.status ?? "Active",
	};
}

export function createPriceListRecord(
	values: PriceListFormValues,
	record?: PriceListRecord,
): PriceListRecord {
	return {
		id: record?.id ?? `price-list-${Date.now()}`,
		code: values.code.trim(),
		name: values.name.trim(),
		customerGroup: values.customerGroup.trim(),
		currencyCode: values.currencyCode.trim().toUpperCase(),
		status: values.status,
	};
}
