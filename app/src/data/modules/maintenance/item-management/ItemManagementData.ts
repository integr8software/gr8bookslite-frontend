import type {
	ItemFormValues,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
	ItemSetupFormValues,
	ItemSupplierAssignment,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";

export const MockItemSetupRecords: Record<ItemSetupKind, ItemSetupRecord[]> = {
	category: [
		{
			id: "cat-supplies",
			code: "SUP",
			name: "Supplies",
			description: "Consumable supplies and operating materials.",
			status: "Active",
		},
		{
			id: "cat-footwear",
			code: "FTW",
			name: "Footwear",
			description: "Shoes, sandals, and related wearable products.",
			status: "Active",
		},
		{
			id: "cat-bundles",
			code: "BND",
			name: "Bundles",
			description: "Bundled items composed of multiple components.",
			status: "Active",
		},
	],
	subcategory: [
		{
			id: "sub-office",
			code: "OFF",
			name: "Office Supplies",
			description: "Standard office consumables.",
			parentIds: ["cat-supplies", "cat-bundles"],
			status: "Active",
		},
		{
			id: "sub-men",
			code: "MEN",
			name: "Men",
			description: "Items commonly classified for men.",
			parentIds: ["cat-footwear"],
			status: "Active",
		},
		{
			id: "sub-women",
			code: "WMN",
			name: "Women",
			description: "Items commonly classified for women.",
			parentIds: ["cat-footwear"],
			status: "Active",
		},
		{
			id: "sub-promotional",
			code: "PRM",
			name: "Promotional",
			description: "Reusable sub category for promotional item groupings.",
			parentIds: [],
			status: "Active",
		},
	],
	type: [
		{
			id: "type-stock",
			code: "STK",
			name: "Product",
			description: "Items tracked as inventory stock.",
			status: "Active",
		},
		{
			id: "type-bundle",
			code: "BND",
			name: "Bundle",
			description: "Items composed of bundle components.",
			status: "Active",
		},
	],
	subtype: [
		{
			id: "subtype-standard",
			code: "STD",
			name: "Standard",
			description: "Standard item subtype.",
			parentIds: ["type-stock", "type-bundle"],
			status: "Active",
		},
		{
			id: "subtype-sellable",
			code: "SEL",
			name: "Sellable",
			description: "Reusable subtype for items available for sale.",
			parentIds: [],
			status: "Active",
		},
	],
};

export const MockItems: ItemRecord[] = [
	{
		id: "item-paper-a4",
		code: "ITM-1001",
		skuCode: "SKU-PAPER-A4",
		name: "Office Paper A4",
		thirdPartyCode: "SUP-A4-80G",
		brand: "PaperOne",
		supplier: "Global Supply Co.",
		suppliers: [
			{
				id: "supplier-paper-global",
				supplier: "Global Supply Co.",
				isDefault: true,
			},
			{
				id: "supplier-paper-northline",
				supplier: "Northline Trading",
				isDefault: false,
			},
		],
		barcode: "4801234567890",
		category: "Supplies",
		subcategory: "Office Supplies",
		type: "Product",
		subtype: "Standard",
		uom: "REAM",
		costPrice: 190,
		sellingPrice: 250,
		taxType: "VATable",
		isVatable: true,
		isVatIncluded: false,
		status: "Active",
		defaultWarehouse: "Main Warehouse",
		supportsBundle: false,
		description: "A4 office paper for daily operations.",
		tags: ["office", "paper"],
		uomConversions: [
			{
				id: "conversion-paper-box",
				fromUom: "BOX",
				quantity: 5,
				toUom: "REAM",
			},
		],
		bundleComponents: [],
	},
	{
		id: "item-thermal-roll",
		code: "ITM-1002",
		skuCode: "SKU-THERMAL-ROLL",
		name: "Thermal Receipt Roll",
		thirdPartyCode: "ROLL-80X80",
		brand: "ThermaPrint",
		supplier: "Global Supply Co.",
		suppliers: [
			{
				id: "supplier-roll-global",
				supplier: "Global Supply Co.",
				isDefault: true,
			},
		],
		barcode: "4801234567906",
		category: "Supplies",
		subcategory: "Office Supplies",
		type: "Product",
		subtype: "Standard",
		uom: "ROLL",
		costPrice: 35,
		sellingPrice: 50,
		taxType: "VATable",
		isVatable: true,
		isVatIncluded: false,
		status: "Active",
		defaultWarehouse: "Main Warehouse",
		supportsBundle: false,
		description: "Thermal paper roll for POS printers.",
		tags: ["pos", "paper"],
		uomConversions: [
			{
				id: "conversion-roll-box",
				fromUom: "BOX",
				quantity: 50,
				toUom: "ROLL",
			},
		],
		bundleComponents: [],
	},
	{
		id: "item-starter-bundle",
		code: "BND-2001",
		skuCode: "SKU-STARTER-BUNDLE",
		name: "Starter Office Bundle",
		thirdPartyCode: "",
		brand: "In-house",
		supplier: "Prime Distributors",
		suppliers: [
			{
				id: "supplier-bundle-prime",
				supplier: "Prime Distributors",
				isDefault: true,
			},
			{
				id: "supplier-bundle-techsource",
				supplier: "TechSource Inc.",
				isDefault: false,
			},
		],
		barcode: "4801234567999",
		category: "Bundles",
		subcategory: "Office Supplies",
		type: "Bundle",
		subtype: "Standard",
		uom: "SET",
		costPrice: 1850,
		sellingPrice: 2450,
		taxType: "VATable",
		isVatable: true,
		isVatIncluded: false,
		status: "Active",
		defaultWarehouse: "Main Warehouse",
		supportsBundle: true,
		description: "Starter bundle for new branch setup.",
		tags: ["bundle", "office"],
		uomConversions: [],
		bundleComponents: [
			{
				id: "bundle-component-paper",
				itemId: "item-paper-a4",
				itemCode: "ITM-1001",
				itemName: "Office Paper A4",
				quantity: 5,
				uom: "REAM",
			},
			{
				id: "bundle-component-roll",
				itemId: "item-thermal-roll",
				itemCode: "ITM-1002",
				itemName: "Thermal Receipt Roll",
				quantity: 10,
				uom: "ROLL",
			},
		],
	},
];

export const ItemInitialFormValues: ItemFormValues = {
	code: "",
	skuCode: "",
	name: "",
	thirdPartyCode: "",
	brand: "",
	suppliers: [],
	barcode: "",
	category: "",
	subcategory: "",
	type: "",
	subtype: "",
	uom: "PCS",
	costPrice: 0,
	sellingPrice: 0,
	isVatable: false,
	isVatIncluded: false,
	status: "Active",
	defaultWarehouse: "Main Warehouse",
	supportsBundle: false,
	description: "",
	tags: [],
	uomConversions: [],
	bundleComponents: [],
};

export const ItemSetupInitialFormValues: ItemSetupFormValues = {
	code: "",
	name: "",
	description: "",
	parentIds: [],
	status: "Active",
};

export function createItemFormValues(item: ItemRecord): ItemFormValues {
	return {
		code: item.code,
		skuCode: item.skuCode,
		name: item.name,
		thirdPartyCode: item.thirdPartyCode,
		brand: item.brand,
		suppliers: createItemSupplierFormValues(item),
		barcode: item.barcode,
		category: item.category,
		subcategory: item.subcategory,
		type: item.type,
		subtype: item.subtype,
		uom: item.uom,
		costPrice: item.costPrice,
		sellingPrice: item.sellingPrice,
		isVatable: item.isVatable ?? item.taxType === "VATable",
		isVatIncluded: item.isVatIncluded ?? item.taxType === "VATIncluded",
		status: item.status,
		defaultWarehouse: item.defaultWarehouse,
		supportsBundle: item.supportsBundle,
		description: item.description,
		tags: item.tags,
		uomConversions: item.uomConversions,
		bundleComponents: item.bundleComponents,
	};
}

export function createItemRecord(values: ItemFormValues): ItemRecord {
	const suppliers = normalizeItemSuppliers(values.suppliers);

	return {
		id: `item-${Date.now()}`,
		...values,
		supplier: getDefaultSupplier(suppliers),
		suppliers,
		taxType: createLegacyItemTaxType(values),
		bundleComponents: values.supportsBundle ? values.bundleComponents : [],
		uomConversions: values.supportsBundle ? [] : values.uomConversions,
	};
}

export function updateItemRecord(
	item: ItemRecord,
	values: ItemFormValues,
): ItemRecord {
	const suppliers = normalizeItemSuppliers(values.suppliers);

	return {
		...item,
		...values,
		supplier: getDefaultSupplier(suppliers),
		suppliers,
		taxType: createLegacyItemTaxType(values),
		bundleComponents: values.supportsBundle ? values.bundleComponents : [],
		uomConversions: values.supportsBundle ? [] : values.uomConversions,
	};
}

function createLegacyItemTaxType(
	values: Pick<ItemFormValues, "isVatable" | "isVatIncluded">,
) {
	if (values.isVatable && !values.isVatIncluded) {
		return "VATable";
	}

	if (values.isVatIncluded && !values.isVatable) {
		return "VATIncluded";
	}

	return undefined;
}

function createItemSupplierFormValues(item: ItemRecord): ItemSupplierAssignment[] {
	const suppliers = item.suppliers ?? [];

	if (suppliers.length > 0) {
		return normalizeItemSuppliers(suppliers);
	}

	return item.supplier
		? [
				{
					id: `supplier-${item.id}`,
					supplier: item.supplier,
					isDefault: true,
				},
			]
		: [];
}

function normalizeItemSuppliers(
	suppliers: ItemSupplierAssignment[],
): ItemSupplierAssignment[] {
	const filledSuppliers = suppliers.filter((supplier) =>
		supplier.supplier.trim(),
	);

	if (filledSuppliers.length === 0) {
		return [];
	}

	const defaultSupplier =
		filledSuppliers.find((supplier) => supplier.isDefault) ??
		filledSuppliers[0];

	return filledSuppliers.map((supplier) => ({
		...supplier,
		supplier: supplier.supplier.trim(),
		isDefault: supplier.id === defaultSupplier.id,
	}));
}

function getDefaultSupplier(suppliers: ItemSupplierAssignment[]) {
	return suppliers.find((supplier) => supplier.isDefault)?.supplier ?? "";
}

export function createItemSetupFormValues(
	record: ItemSetupRecord,
): ItemSetupFormValues {
	return {
		code: record.code,
		name: record.name,
		description: record.description,
		parentIds: record.parentIds ?? [],
		status: record.status,
	};
}

export function createItemSetupRecord(
	values: ItemSetupFormValues,
): ItemSetupRecord {
	return {
		id: `item-setup-${Date.now()}`,
		...values,
	};
}

export function updateItemSetupRecord(
	record: ItemSetupRecord,
	values: ItemSetupFormValues,
): ItemSetupRecord {
	return {
		...record,
		...values,
	};
}
