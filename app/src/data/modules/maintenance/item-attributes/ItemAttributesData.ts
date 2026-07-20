import type { ItemAttributeFormValues, ItemAttributeRecord, ItemAttributeValue } from "@/app/src/types/modules/maintenance/item-attributes/ItemAttributesTypes";

export const MockItemAttributes: ItemAttributeRecord[] = [
  {
    id: "item-attribute-color",
    code: "ATT-001",
    name: "Color",
    usage: "Variant",
    values: createUsedAttributeValues("color", [
      "Black",
      "White",
      "Red",
      "Blue",
      "Green",
      "Gray",
      "Yellow",
      "Orange",
      "Purple",
      "Pink",
      "Brown",
      "Transparent",
    ]),
    requiredOnItem: false,
    affectsStock: true,
    status: "Active",
  },
  {
    id: "item-attribute-size",
    code: "ATT-002",
    name: "Size",
    usage: "Variant",
    values: createUsedAttributeValues("size", ["XS", "Small", "Medium", "Large", "XL", "XXL"]),
    requiredOnItem: false,
    affectsStock: true,
    status: "Active",
  },
  {
    id: "item-attribute-material",
    code: "ATT-003",
    name: "Material",
    usage: "Item Detail",
    values: createUsedAttributeValues("material", ["Cotton", "Plastic", "Steel", "Wood", "Glass", "Paper", "Leather"]),
    requiredOnItem: false,
    affectsStock: false,
    status: "Active",
  },
  {
    id: "item-attribute-grade",
    code: "ATT-004",
    name: "Grade",
    usage: "Stock Classification",
    values: createUsedAttributeValues("grade", ["A", "B", "C"]),
    requiredOnItem: false,
    affectsStock: true,
    status: "Active",
  },
  {
    id: "item-attribute-serving-temperature",
    code: "ATT-005",
    name: "Serving Temperature",
    usage: "Item Detail",
    values: createUsedAttributeValues("serving-temperature", ["Hot", "Cold", "Mild"]),
    requiredOnItem: false,
    affectsStock: false,
    status: "Active",
  },
];

export function createItemAttributeFormValues(record?: ItemAttributeRecord): ItemAttributeFormValues {
  return {
    name: record?.name ?? "",
    values: record?.values ?? [createAttributeValue("")],
    status: record?.status ?? "Active",
  };
}

export function createItemAttributeRecord(values: ItemAttributeFormValues, record?: ItemAttributeRecord): ItemAttributeRecord {
  return {
    id: record?.id ?? `item-attribute-${Date.now()}`,
    code: record?.code ?? `ATT-${Date.now()}`,
    name: values.name.trim(),
    usage: record?.usage ?? "Item Detail",
    values: values.values.map((value) => ({ ...value, label: value.label.trim() })).filter((value) => value.label),
    requiredOnItem: record?.requiredOnItem ?? false,
    affectsStock: record?.affectsStock ?? false,
    status: values.status,
  };
}

export function createAttributeValue(label: string): ItemAttributeValue {
  return {
    id: `attribute-value-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    isUsed: false,
    status: "Active",
  };
}

function createUsedAttributeValues(attributeKey: string, values: string[]): ItemAttributeValue[] {
  return values.map((value) => ({
    id: `attribute-value-${attributeKey}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: value,
    isUsed: true,
    status: "Active",
  }));
}
