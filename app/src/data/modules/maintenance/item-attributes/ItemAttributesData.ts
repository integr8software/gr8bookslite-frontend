import type {
	ItemAttributeFormValues,
	ItemAttributeRecord,
} from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";

export const MockItemAttributes: ItemAttributeRecord[] = [
	{
		id: "item-attribute-color",
		name: "Color",
		values: ["Red", "Blue", "Black", "White"],
		status: "Active",
	},
	{
		id: "item-attribute-size",
		name: "Size",
		values: ["Small", "Medium", "Large", "XL"],
		status: "Active",
	},
	{
		id: "item-attribute-material",
		name: "Material",
		values: ["Cotton", "Steel", "Plastic", "Wood"],
		status: "Active",
	},
];

export function createItemAttributeFormValues(
	record?: ItemAttributeRecord,
): ItemAttributeFormValues {
	return {
		name: record?.name ?? "",
		values: record?.values ?? [""],
		status: record?.status ?? "Active",
	};
}

export function createItemAttributeRecord(
	values: ItemAttributeFormValues,
	record?: ItemAttributeRecord,
): ItemAttributeRecord {
	return {
		id: record?.id ?? `item-attribute-${Date.now()}`,
		name: values.name.trim(),
		values: values.values.map((value) => value.trim()).filter(Boolean),
		status: values.status,
	};
}
