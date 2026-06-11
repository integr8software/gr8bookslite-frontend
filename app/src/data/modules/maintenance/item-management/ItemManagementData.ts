import type {
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryClassificationFormValues,
	ItemFormValues,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
	ItemSupplierAssignment,
} from "@/app/src/types/modules/maintenance/item-management/ItemManagementTypes";
import { ItemCategorySystemDefaultAccountingSetup } from "@/app/src/constants/modules/maintenance/item-management/ItemManagementConstants";

type ItemCategoryTreeNode = {
	name: string;
	children?: ItemCategoryTreeNode[];
};

const ItemCategorySampleTree: ItemCategoryTreeNode[] = [
	{
		name: "Electronics",
		children: [
			{
				name: "Audio & Video",
				children: [
					{ name: "Televisions" },
					{ name: "Speakers" },
					{ name: "Soundbars" },
					{ name: "Home Theater Systems" },
				],
			},
			{
				name: "Cameras",
				children: [
					{ name: "DSLR Cameras" },
					{ name: "Mirrorless Cameras" },
					{ name: "Action Cameras" },
				],
			},
			{
				name: "Wearable Technology",
				children: [{ name: "Smart Watches" }, { name: "Fitness Trackers" }],
			},
		],
	},
	{
		name: "Computers & Accessories",
		children: [
			{
				name: "Computers",
				children: [
					{ name: "Desktops" },
					{
						name: "Laptops",
						children: [
							{ name: "Business Laptops" },
							{ name: "Gaming Laptops" },
							{ name: "Student Laptops" },
						],
					},
					{ name: "Workstations" },
				],
			},
			{
				name: "Computer Components",
				children: [
					{ name: "Processors" },
					{ name: "Motherboards" },
					{ name: "Memory (RAM)" },
					{ name: "Graphics Cards" },
					{ name: "Storage Devices" },
				],
			},
			{
				name: "Accessories",
				children: [
					{ name: "Keyboards" },
					{ name: "Mice" },
					{ name: "Monitors" },
					{ name: "Printers" },
				],
			},
		],
	},
	{
		name: "Mobile Phones & Tablets",
		children: [
			{ name: "Smartphones" },
			{ name: "Tablets" },
			{
				name: "Mobile Accessories",
				children: [
					{ name: "Cases" },
					{ name: "Chargers" },
					{ name: "Screen Protectors" },
					{ name: "Power Banks" },
				],
			},
			{ name: "Smart Devices" },
		],
	},
	{
		name: "Home Appliances",
		children: [
			{
				name: "Kitchen Appliances",
				children: [
					{ name: "Refrigerators" },
					{ name: "Microwave Ovens" },
					{ name: "Rice Cookers" },
				],
			},
			{
				name: "Laundry Appliances",
				children: [{ name: "Washing Machines" }, { name: "Dryers" }],
			},
			{
				name: "Cleaning Appliances",
				children: [{ name: "Vacuum Cleaners" }, { name: "Air Purifiers" }],
			},
		],
	},
	{
		name: "Furniture",
		children: [
			{
				name: "Office Furniture",
				children: [
					{ name: "Office Chairs" },
					{ name: "Office Tables" },
					{ name: "Filing Cabinets" },
				],
			},
			{
				name: "Home Furniture",
				children: [{ name: "Sofas" }, { name: "Beds" }, { name: "Dining Sets" }],
			},
			{ name: "Outdoor Furniture" },
		],
	},
	{
		name: "Office Supplies",
		children: [
			{ name: "Paper Products" },
			{ name: "Writing Materials" },
			{ name: "Filing & Storage" },
			{ name: "Office Equipment" },
			{ name: "School Supplies" },
		],
	},
	{
		name: "Food & Beverages",
		children: [
			{
				name: "Food",
				children: [
					{ name: "Snacks" },
					{ name: "Canned Goods" },
					{ name: "Frozen Foods" },
					{ name: "Bakery Products" },
				],
			},
			{
				name: "Beverages",
				children: [
					{ name: "Coffee" },
					{ name: "Tea" },
					{ name: "Soft Drinks" },
					{ name: "Bottled Water" },
				],
			},
			{ name: "Ingredients" },
		],
	},
	{
		name: "Clothing & Apparel",
		children: [
			{ name: "Men's Clothing" },
			{ name: "Women's Clothing" },
			{ name: "Children's Clothing" },
			{ name: "Footwear" },
			{ name: "Fashion Accessories" },
		],
	},
	{
		name: "Health & Beauty",
		children: [
			{ name: "Skincare" },
			{ name: "Cosmetics" },
			{ name: "Personal Care" },
			{ name: "Vitamins & Supplements" },
			{ name: "Medical Supplies" },
		],
	},
	{
		name: "Automotive",
		children: [
			{
				name: "Vehicle Parts",
				children: [
					{ name: "Engine Parts" },
					{ name: "Brake Parts" },
					{ name: "Suspension Parts" },
				],
			},
			{ name: "Tires & Wheels" },
			{ name: "Automotive Fluids" },
			{ name: "Car Accessories" },
		],
	},
	{
		name: "Construction Materials",
		children: [
			{ name: "Cement & Concrete" },
			{ name: "Steel & Metal" },
			{ name: "Lumber & Wood" },
			{ name: "Roofing Materials" },
			{ name: "Electrical Materials" },
			{ name: "Plumbing Materials" },
		],
	},
	{
		name: "Tools & Hardware",
		children: [
			{ name: "Hand Tools" },
			{ name: "Power Tools" },
			{ name: "Measuring Tools" },
			{ name: "Safety Equipment" },
			{
				name: "Fasteners",
				children: [
					{ name: "Screws" },
					{ name: "Nuts" },
					{ name: "Bolts" },
					{ name: "Washers" },
				],
			},
		],
	},
	{
		name: "Sports & Recreation",
		children: [
			{ name: "Fitness Equipment" },
			{ name: "Outdoor Equipment" },
			{ name: "Team Sports" },
			{ name: "Cycling" },
		],
	},
	{
		name: "Toys & Games",
		children: [
			{ name: "Educational Toys" },
			{ name: "Action Figures" },
			{ name: "Board Games" },
			{ name: "Video Games" },
		],
	},
	{
		name: "Books & Stationery",
		children: [
			{ name: "Books" },
			{ name: "Notebooks" },
			{ name: "Art Supplies" },
			{ name: "Educational Materials" },
		],
	},
	{
		name: "Pet Supplies",
		children: [
			{ name: "Pet Food" },
			{ name: "Pet Accessories" },
			{ name: "Pet Healthcare" },
			{ name: "Pet Toys" },
		],
	},
	{
		name: "Agricultural Products",
		children: [
			{ name: "Seeds" },
			{ name: "Fertilizers" },
			{ name: "Farm Equipment" },
			{ name: "Animal Feed" },
			{ name: "Crop Protection" },
		],
	},
	{
		name: "Software & Digital Products",
		children: [
			{ name: "Software Licenses" },
			{ name: "SaaS Subscriptions" },
			{ name: "Digital Downloads" },
			{ name: "Templates" },
			{ name: "Online Courses" },
		],
	},
	{ name: "Other Products" },
];

export const MockItemSetupRecords: Record<ItemSetupKind, ItemSetupRecord[]> = {
	category: createItemCategorySampleRecords(ItemCategorySampleTree),
	subcategory: [],
	type: [],
	subtype: [],
};

function createItemCategorySampleRecords(
	nodes: ItemCategoryTreeNode[],
	parentId?: string,
	parentPath: string[] = [],
): ItemSetupRecord[] {
	return nodes.flatMap((node) => {
		const path = [...parentPath, node.name];
		const id = `cat-${path.map(createItemCategorySlug).join("-")}`;
		const record: ItemSetupRecord = {
			id,
			code: createItemCategoryCode(node.name),
			name: node.name,
			description: `Product category for ${node.name}.`,
			accountingSetupMode: parentId ? "inherit" : "notSet",
			parentIds: parentId ? [parentId] : [],
			allowSubCategory: true,
			status: "Active",
		};

		return [
			record,
			...createItemCategorySampleRecords(node.children ?? [], id, path),
		];
	});
}

function createItemCategorySlug(name: string) {
	const slug = name
		.trim()
		.toLowerCase()
		.replace(/&/g, " and ")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || "category";
}

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
		defaultWarehouse: "North Warehouse",
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

export const ItemCategoryClassificationInitialFormValues: ItemCategoryClassificationFormValues =
	{
		name: "",
		parentId: "",
		description: "",
		accountingSetupMode: "inherit",
		accountingSetup: ItemCategorySystemDefaultAccountingSetup,
		allowSubCategory: true,
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

export function createItemCategoryClassificationFormValues(
	record: ItemSetupRecord,
): ItemCategoryClassificationFormValues {
	const accountingSetup = normalizeItemCategoryAccountingSetup(
		record.accountingSetup,
	);

	return {
		name: record.name,
		parentId: record.parentIds?.[0] ?? "",
		description: record.description,
		accountingSetupMode: getItemCategoryAccountingSetupMode(record),
		accountingSetup,
		allowSubCategory: record.allowSubCategory ?? true,
		status: record.status,
	};
}

export function createItemCategoryClassificationRecord(
	values: ItemCategoryClassificationFormValues,
): ItemSetupRecord {
	return {
		id: `item-category-${Date.now()}`,
		code: createItemCategoryCode(values.name),
		name: values.name.trim(),
		description: values.description.trim(),
		parentIds: values.parentId ? [values.parentId] : [],
		accountingSetupMode: values.accountingSetupMode,
		accountingSetup: values.accountingSetupMode === "own"
			? values.accountingSetup
			: undefined,
		allowSubCategory: values.allowSubCategory,
		status: values.status,
	};
}

export function updateItemCategoryClassificationRecord(
	record: ItemSetupRecord,
	values: ItemCategoryClassificationFormValues,
): ItemSetupRecord {
	return {
		...record,
		name: values.name.trim(),
		description: values.description.trim(),
		parentIds: values.parentId ? [values.parentId] : [],
		accountingSetupMode: values.accountingSetupMode,
		accountingSetup: values.accountingSetupMode === "own"
			? values.accountingSetup
			: undefined,
		allowSubCategory: values.allowSubCategory,
		status: values.status,
	};
}

export function hasItemCategoryAccountingSetup(
	accountingSetup: Partial<ItemCategoryAccountingSetup> | undefined,
) {
	if (!accountingSetup) {
		return false;
	}

	return Object.values(accountingSetup).some((value) => Boolean(value?.trim()));
}

export function getItemCategoryAccountingSetupMode(
	record: Pick<ItemSetupRecord, "accountingSetup" | "accountingSetupMode">,
): ItemCategoryAccountingSetupMode {
	if (record.accountingSetupMode) {
		return record.accountingSetupMode;
	}

	return hasItemCategoryAccountingSetup(record.accountingSetup)
		? "own"
		: "inherit";
}

export function normalizeItemCategoryAccountingSetup(
	accountingSetup: Partial<ItemCategoryAccountingSetup> | undefined,
): ItemCategoryAccountingSetup {
	return {
		...ItemCategorySystemDefaultAccountingSetup,
		...accountingSetup,
	};
}

function createItemCategoryCode(name: string) {
	const normalizedName = name.trim();

	if (!normalizedName) {
		return "CAT";
	}

	const initials = normalizedName
		.split(/\s+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase())
		.join("")
		.slice(0, 6);

	return initials || "CAT";
}
