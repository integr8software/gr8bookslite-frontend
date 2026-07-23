import type { ItemVariationFormValues, ItemVariationRecord, ItemVariationValue } from "@/app/src/types/modules/item-management/item-variations/ItemVariationsTypes";

export const MockItemVariations: ItemVariationRecord[] = [
  {
    id: "item-variation-color",
    code: "ATT-001",
    name: "Color",
    usage: "Variant",
    values: createUsedVariationValues("color", [
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
    id: "item-variation-size",
    code: "ATT-002",
    name: "Size",
    usage: "Variant",
    values: createUsedVariationValues("size", ["XS", "Small", "Medium", "Large", "XL", "XXL"]),
    requiredOnItem: false,
    affectsStock: true,
    status: "Active",
  },
  {
    id: "item-variation-material",
    code: "ATT-003",
    name: "Material",
    usage: "Item Detail",
    values: createUsedVariationValues("material", ["Cotton", "Plastic", "Steel", "Wood", "Glass", "Paper", "Leather"]),
    requiredOnItem: false,
    affectsStock: false,
    status: "Active",
  },
  {
    id: "item-variation-grade",
    code: "ATT-004",
    name: "Grade",
    usage: "Stock Classification",
    values: createUsedVariationValues("grade", ["A", "B", "C"]),
    requiredOnItem: false,
    affectsStock: true,
    status: "Active",
  },
  {
    id: "item-variation-serving-temperature",
    code: "ATT-005",
    name: "Serving Temperature",
    usage: "Item Detail",
    values: createUsedVariationValues("serving-temperature", ["Hot", "Cold", "Mild"]),
    requiredOnItem: false,
    affectsStock: false,
    status: "Active",
  },
];

export function createItemVariationFormValues(record?: ItemVariationRecord): ItemVariationFormValues {
  return {
    name: record?.name ?? "",
    values: record?.values ?? [createVariationValue("")],
    status: record?.status ?? "Active",
  };
}

export function createItemVariationRecord(values: ItemVariationFormValues, record?: ItemVariationRecord): ItemVariationRecord {
  return {
    id: record?.id ?? `item-variation-${Date.now()}`,
    code: record?.code ?? `ATT-${Date.now()}`,
    name: values.name.trim(),
    usage: record?.usage ?? "Item Detail",
    values: values.values.map((value) => ({ ...value, label: value.label.trim() })).filter((value) => value.label),
    requiredOnItem: record?.requiredOnItem ?? false,
    affectsStock: record?.affectsStock ?? false,
    status: values.status,
  };
}

export function createVariationValue(label: string): ItemVariationValue {
  return {
    id: `variation-value-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    isUsed: false,
    status: "Active",
  };
}

function createUsedVariationValues(variationKey: string, values: string[]): ItemVariationValue[] {
  return values.map((value) => ({
    id: `variation-value-${variationKey}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label: value,
    isUsed: true,
    status: "Active",
  }));
}
