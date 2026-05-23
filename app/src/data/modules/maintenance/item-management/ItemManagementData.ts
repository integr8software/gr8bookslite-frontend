import type {
	ItemFormValues,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
	ItemSetupFormValues,
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
			status: "Active",
		},
	],
	type: [
		{
			id: "type-stock",
			code: "STK",
			name: "Stock Item",
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
			status: "Active",
		},
	],
};

export const MockItems: ItemRecord[] = [
	{
		id: "item-paper-a4",
		code: "ITM-1001",
		name: "Office Paper A4",
		category: "Supplies",
		subcategory: "Office Supplies",
		type: "Stock Item",
		subtype: "Standard",
		trackingType: "Inventory",
		uom: "REAM",
		status: "Active",
		supportsBundle: false,
		description: "A4 office paper for daily operations.",
		bundleComponents: [],
	},
	{
		id: "item-starter-bundle",
		code: "BND-2001",
		name: "Starter Office Bundle",
		category: "Bundles",
		subcategory: "Office Supplies",
		type: "Bundle",
		subtype: "Standard",
		trackingType: "Inventory",
		uom: "SET",
		status: "Active",
		supportsBundle: true,
		description: "Starter bundle for new branch setup.",
		bundleComponents: [
			{
				id: "bundle-component-paper",
				itemCode: "ITM-1001",
				itemName: "Office Paper A4",
				quantity: 5,
				uom: "REAM",
			},
			{
				id: "bundle-component-roll",
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
	name: "",
	category: "",
	subcategory: "",
	type: "",
	subtype: "",
	trackingType: "Inventory",
	uom: "PC",
	status: "Active",
	supportsBundle: false,
	description: "",
	bundleComponents: [],
};

export const ItemSetupInitialFormValues: ItemSetupFormValues = {
	code: "",
	name: "",
	description: "",
	status: "Active",
};

export function createItemFormValues(item: ItemRecord): ItemFormValues {
	return {
		code: item.code,
		name: item.name,
		category: item.category,
		subcategory: item.subcategory,
		type: item.type,
		subtype: item.subtype,
		trackingType: item.trackingType,
		uom: item.uom,
		status: item.status,
		supportsBundle: item.supportsBundle,
		description: item.description,
		bundleComponents: item.bundleComponents,
	};
}

export function createItemRecord(values: ItemFormValues): ItemRecord {
	return {
		id: `item-${Date.now()}`,
		...values,
		bundleComponents: values.supportsBundle ? values.bundleComponents : [],
	};
}

export function updateItemRecord(
	item: ItemRecord,
	values: ItemFormValues,
): ItemRecord {
	return {
		...item,
		...values,
		bundleComponents: values.supportsBundle ? values.bundleComponents : [],
	};
}

export function createItemSetupFormValues(
	record: ItemSetupRecord,
): ItemSetupFormValues {
	return {
		code: record.code,
		name: record.name,
		description: record.description,
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

