import type {
	ItemCategoryAccountingSetup,
	ItemCategoryAccountingSetupMode,
	ItemCategoryFormValues,
	ItemAttributeRecord,
	ItemBundleRecord,
	ItemFormValues,
	ItemPriceListRecord,
	ItemRecord,
	ItemSetupKind,
	ItemSetupRecord,
	ItemSupplierAssignment,
	ItemSupplierRecord,
} from "@/app/src/types/modules/maintenance/items/ItemManagementTypes";
import { ItemCategorySystemDefaultAccountingSetup } from "@/app/src/constants/modules/maintenance/items/ItemManagementConstants";

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

const ItemCategorySeedAudit = {
	createdAt: "2026-01-01T08:00:00.000Z",
	createdBy: "System Seeder",
	updatedAt: "2026-01-01T08:00:00.000Z",
	updatedBy: "System Seeder",
} as const;

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
			accountingSetupMode: parentId ? "inherit" : "own",
			parentIds: parentId ? [parentId] : [],
			allowSubCategory: true,
			status: "Active",
			...ItemCategorySeedAudit,
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
		model: "A4 80G",
		externalReferenceCode: "LEG-A4-80G",
		brand: "PaperOne",
		supplier: "Global Supply Co.",
		suppliers: [
			{
				id: "supplier-paper-global",
				supplier: "Global Supply Co.",
				supplierItemCode: "SUP-A4-80G",
				leadTime: "3 days",
				lastCost: 190,
				isDefault: true,
			},
			{
				id: "supplier-paper-northline",
				supplier: "Northline Trading",
				supplierItemCode: "NL-A4-REAM",
				leadTime: "5 days",
				lastCost: 195,
				isDefault: false,
			},
		],
		barcode: "4801234567890",
		category: "Office Supplies",
		primaryCategory: "Office Supplies",
		categories: ["Office Supplies", "Paper Products"],
		uom: "REAM",
		responsibilityCenter: "Operations",
		costPrice: 190,
		sellingPrice: 250,
		taxTreatment: "VAT Exclusive",
		status: "Active",
		defaultWarehouse: "Main Warehouse",
		defaultLocation: "WH-A-Z1-R01-S02-B03",
		defaultZone: "Zone A",
		defaultRack: "R01",
		defaultShelf: "S02",
		defaultBin: "B03",
		defaultLotNo: "LOT-A4-2026-01",
		leadTime: "3 days",
		reorderLevel: 100,
		minimumStock: 50,
		maximumStock: 700,
		perishability: "Non Perishable",
		behavior: "Finished Goods",
		sellable: true,
		purchasable: true,
		trackInventory: true,
		service: false,
		asset: false,
		hasVariants: false,
		lotTracking: false,
		serialTracking: false,
		attributeAssignments: [
			{ id: "item-paper-attr-material", attributeId: "attr-material", value: "Paper" },
			{ id: "item-paper-attr-lot-grade", attributeId: "attr-lot-grade", value: "A" },
		],
		priceListPrices: [
			{ id: "item-paper-price-retail", priceListId: "price-retail", price: 250 },
			{ id: "item-paper-price-wholesale", priceListId: "price-wholesale", price: 230 },
			{ id: "item-paper-price-dealer", priceListId: "price-dealer", price: 220 },
		],
		description: "A4 office paper for daily operations.",
		tags: ["office", "paper"],
	},
	{
		id: "item-thermal-roll",
		code: "ITM-1002",
		skuCode: "SKU-THERMAL-ROLL",
		name: "Thermal Receipt Roll",
		model: "80x80",
		externalReferenceCode: "POS-ROLL-80X80",
		brand: "ThermaPrint",
		supplier: "Global Supply Co.",
		suppliers: [
			{
				id: "supplier-roll-global",
				supplier: "Global Supply Co.",
				supplierItemCode: "ROLL-80X80",
				leadTime: "4 days",
				lastCost: 35,
				isDefault: true,
			},
		],
		barcode: "4801234567906",
		category: "Office Supplies",
		primaryCategory: "Office Supplies",
		categories: ["Office Supplies", "POS Supplies"],
		uom: "ROLL",
		responsibilityCenter: "Retail Operations",
		costPrice: 35,
		sellingPrice: 50,
		taxTreatment: "VAT Exclusive",
		status: "Active",
		defaultWarehouse: "North Warehouse",
		defaultLocation: "WH-N-Z1-R01-S01-B02",
		defaultZone: "Zone 1",
		defaultRack: "R01",
		defaultShelf: "S01",
		defaultBin: "B02",
		defaultLotNo: "LOT-TR-2026-02",
		leadTime: "4 days",
		reorderLevel: 80,
		minimumStock: 40,
		maximumStock: 500,
		perishability: "Non Perishable",
		behavior: "Consumable Item",
		sellable: true,
		purchasable: true,
		trackInventory: true,
		service: false,
		asset: false,
		hasVariants: false,
		lotTracking: false,
		serialTracking: false,
		attributeAssignments: [
			{ id: "item-roll-attr-material", attributeId: "attr-material", value: "Paper" },
		],
		priceListPrices: [
			{ id: "item-roll-price-retail", priceListId: "price-retail", price: 50 },
			{ id: "item-roll-price-wholesale", priceListId: "price-wholesale", price: 45 },
			{ id: "item-roll-price-dealer", priceListId: "price-dealer", price: 43 },
		],
		description: "Thermal paper roll for POS printers.",
		tags: ["pos", "paper"],
	},
	{
		id: "item-starter-bundle",
		code: "BND-2001",
		skuCode: "SKU-STARTER-BUNDLE",
		name: "Starter Office Bundle",
		model: "STARTER-SET",
		externalReferenceCode: "ECOM-STARTER-OFFICE",
		brand: "In-house",
		supplier: "Prime Distributors",
		suppliers: [
			{
				id: "supplier-bundle-prime",
				supplier: "Prime Distributors",
				supplierItemCode: "BND-OFFICE-START",
				leadTime: "2 days",
				lastCost: 1850,
				isDefault: true,
			},
			{
				id: "supplier-bundle-techsource",
				supplier: "TechSource Inc.",
				supplierItemCode: "TS-OFFICE-KIT",
				leadTime: "6 days",
				lastCost: 1900,
				isDefault: false,
			},
		],
		barcode: "4801234567999",
		category: "Office Supplies",
		primaryCategory: "Office Supplies",
		categories: ["Office Supplies", "Bundles"],
		uom: "SET",
		responsibilityCenter: "Branch Setup",
		costPrice: 1850,
		sellingPrice: 2450,
		taxTreatment: "VAT Inclusive",
		status: "Active",
		defaultWarehouse: "Main Warehouse",
		defaultLocation: "WH-A-Z1-R02-S01-B01",
		defaultZone: "Zone A",
		defaultRack: "R02",
		defaultShelf: "S01",
		defaultBin: "B01",
		defaultLotNo: "",
		leadTime: "2 days",
		reorderLevel: 10,
		minimumStock: 5,
		maximumStock: 60,
		perishability: "Non Perishable",
		behavior: "Finished Goods",
		sellable: true,
		purchasable: false,
		trackInventory: true,
		service: false,
		asset: false,
		hasVariants: false,
		lotTracking: false,
		serialTracking: false,
		attributeAssignments: [
			{ id: "item-bundle-attr-material", attributeId: "attr-material", value: "Mixed" },
		],
		priceListPrices: [
			{ id: "item-bundle-price-retail", priceListId: "price-retail", price: 2450 },
			{ id: "item-bundle-price-wholesale", priceListId: "price-wholesale", price: 2280 },
			{ id: "item-bundle-price-dealer", priceListId: "price-dealer", price: 2200 },
		],
		description: "Starter bundle for new branch setup.",
		tags: ["bundle", "office"],
	},
];

export const MockItemBundles: ItemBundleRecord[] = [
	{
		id: "bundle-office-starter",
		code: "BND-2001",
		name: "Starter Office Bundle",
		bundlePrice: 1750,
		status: "Active",
		lines: [
			{ id: "line-paper", itemId: "item-paper-a4", quantity: 5 },
			{ id: "line-roll", itemId: "item-thermal-roll", quantity: 10 },
		],
	},
	{
		id: "bundle-pos-kit",
		code: "BND-2002",
		name: "POS Counter Kit",
		bundlePrice: 1850,
		status: "Active",
		lines: [
			{ id: "line-pos-roll", itemId: "item-thermal-roll", quantity: 20 },
			{ id: "line-pos-bundle", itemId: "item-starter-bundle", quantity: 1 },
		],
	},
];

export const MockItemAttributes: ItemAttributeRecord[] = [
	{
		id: "attr-color",
		code: "ATT-001",
		name: "Color",
		usage: "Variant",
		values: ["Red", "Blue", "Black", "White"],
		requiredOnItem: false,
		affectsStock: true,
		status: "Active",
	},
	{
		id: "attr-size",
		code: "ATT-002",
		name: "Size",
		usage: "Variant",
		values: ["Small", "Medium", "Large", "XL"],
		requiredOnItem: false,
		affectsStock: true,
		status: "Active",
	},
	{
		id: "attr-storage",
		code: "ATT-003",
		name: "Storage",
		usage: "Variant",
		values: ["128GB", "256GB", "512GB", "1TB"],
		requiredOnItem: false,
		affectsStock: true,
		status: "Active",
	},
	{
		id: "attr-material",
		code: "ATT-004",
		name: "Material",
		usage: "Item Detail",
		values: ["Cotton", "Steel", "Plastic", "Wood", "Paper", "Mixed"],
		requiredOnItem: false,
		affectsStock: false,
		status: "Active",
	},
	{
		id: "attr-lot-grade",
		code: "ATT-005",
		name: "Lot Grade",
		usage: "Stock Classification",
		values: ["A", "B", "C", "Return"],
		requiredOnItem: false,
		affectsStock: true,
		status: "Active",
	},
];

export const MockItemSuppliers: ItemSupplierRecord[] = [
	{
		id: "supplier-techsource",
		code: "SUP-001",
		name: "TechSource Inc.",
		contactPerson: "Procurement Desk",
		contactDetails: "procurement@techsource.example",
		status: "Active",
	},
	{
		id: "supplier-global-supply",
		code: "SUP-002",
		name: "Global Supply Co.",
		contactPerson: "Customer Service",
		contactDetails: "orders@globalsupply.example",
		status: "Active",
	},
	{
		id: "supplier-prime-distributors",
		code: "SUP-003",
		name: "Prime Distributors",
		contactPerson: "Sales Team",
		contactDetails: "sales@primedistributors.example",
		status: "Active",
	},
	{
		id: "supplier-northline",
		code: "SUP-004",
		name: "Northline Trading",
		contactPerson: "Accounts Desk",
		contactDetails: "accounts@northline.example",
		status: "Active",
	},
];

export const MockPriceLists: ItemPriceListRecord[] = [
	{
		id: "price-retail",
		code: "PL-001",
		name: "Retail",
		currency: "PHP",
		customerType: "Walk-in and regular customers",
		pricingMode: "Manual",
		markupPercent: 0,
		status: "Active",
	},
	{
		id: "price-wholesale",
		code: "PL-002",
		name: "Wholesale",
		currency: "PHP",
		customerType: "Volume buyers",
		pricingMode: "Discount From Retail",
		markupPercent: 8,
		status: "Active",
	},
	{
		id: "price-dealer",
		code: "PL-003",
		name: "Dealer",
		currency: "PHP",
		customerType: "Resellers and dealers",
		pricingMode: "Discount From Retail",
		markupPercent: 12,
		status: "Active",
	},
	{
		id: "price-vip",
		code: "PL-004",
		name: "VIP",
		currency: "PHP",
		customerType: "Preferred accounts",
		pricingMode: "Discount From Retail",
		markupPercent: 5,
		status: "Inactive",
	},
];

export const ItemInitialFormValues: ItemFormValues = {
	code: "",
	skuCode: "",
	name: "",
	model: "",
	externalReferenceCode: "",
	brand: "",
	suppliers: [],
	barcode: "",
	primaryCategory: "",
	uom: "PC",
	responsibilityCenter: "",
	costPrice: 0,
	sellingPrice: 0,
	taxTreatment: "VAT Exclusive",
	status: "Active",
	defaultWarehouse: "Main Warehouse",
	defaultLocation: "",
	defaultZone: "",
	defaultRack: "",
	defaultShelf: "",
	defaultBin: "",
	defaultLotNo: "",
	leadTime: "",
	reorderLevel: 0,
	minimumStock: 0,
	maximumStock: 0,
	perishability: "Non Perishable",
	behavior: "Finished Goods",
	sellable: true,
	purchasable: true,
	trackInventory: true,
	service: false,
	asset: false,
	hasVariants: false,
	lotTracking: false,
	serialTracking: false,
	attributeAssignments: [],
	priceListPrices: [],
	description: "",
	tags: [],
};

export const ItemCategoryInitialFormValues: ItemCategoryFormValues =
	{
		name: "",
		parentId: "",
		description: "",
		accountingSetupMode: "own",
		accountingSetup: createItemCategoryGeneratedAccountingSetup(""),
		allowSubCategory: true,
		status: "Active",
	};

export function createItemFormValues(item: ItemRecord): ItemFormValues {
	return {
		code: item.code,
		skuCode: item.skuCode,
		name: item.name,
		model: item.model,
		externalReferenceCode: item.externalReferenceCode,
		brand: item.brand,
		suppliers: createItemSupplierFormValues(item),
		barcode: item.barcode,
		primaryCategory: item.primaryCategory || item.category,
		uom: item.uom,
		responsibilityCenter: item.responsibilityCenter,
		costPrice: item.costPrice,
		sellingPrice: item.sellingPrice,
		taxTreatment: item.taxTreatment,
		status: item.status,
		defaultWarehouse: item.defaultWarehouse,
		defaultLocation: item.defaultLocation,
		defaultZone: item.defaultZone,
		defaultRack: item.defaultRack,
		defaultShelf: item.defaultShelf,
		defaultBin: item.defaultBin,
		defaultLotNo: item.defaultLotNo,
		leadTime: item.leadTime,
		reorderLevel: item.reorderLevel,
		minimumStock: item.minimumStock,
		maximumStock: item.maximumStock,
		perishability: item.perishability,
		behavior: item.behavior,
		sellable: item.sellable,
		purchasable: item.purchasable,
		trackInventory: item.trackInventory,
		service: item.service,
		asset: item.asset,
		hasVariants: item.hasVariants,
		lotTracking: item.lotTracking,
		serialTracking: item.serialTracking,
		attributeAssignments: item.attributeAssignments ?? [],
		priceListPrices: item.priceListPrices ?? [],
		description: item.description,
		tags: item.tags,
	};
}

export function createItemRecord(values: ItemFormValues): ItemRecord {
	const suppliers = normalizeItemSuppliers(values.suppliers);

	return {
		id: `item-${Date.now()}`,
		...values,
		category: values.primaryCategory,
		categories: [values.primaryCategory].filter(Boolean),
		supplier: getDefaultSupplier(suppliers),
		suppliers,
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
		category: values.primaryCategory,
		categories: [values.primaryCategory].filter(Boolean),
		supplier: getDefaultSupplier(suppliers),
		suppliers,
	};
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
					supplierItemCode: "",
					leadTime: "",
					lastCost: item.costPrice,
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
		supplierItemCode: supplier.supplierItemCode.trim(),
		leadTime: supplier.leadTime.trim(),
		lastCost: supplier.lastCost,
		isDefault: supplier.id === defaultSupplier.id,
	}));
}

function getDefaultSupplier(suppliers: ItemSupplierAssignment[]) {
	return suppliers.find((supplier) => supplier.isDefault)?.supplier ?? "";
}

export function createItemCategoryFormValues(
	record: ItemSetupRecord,
): ItemCategoryFormValues {
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

export function createItemCategoryRecord(
	values: ItemCategoryFormValues,
): ItemSetupRecord {
	const name = values.name.trim();
	const createdAt = new Date().toISOString();

	return {
		id: `item-category-${Date.now()}`,
		code: createItemCategoryCode(name),
		name,
		description: values.description.trim(),
		parentIds: values.parentId ? [values.parentId] : [],
		accountingSetupMode: values.accountingSetupMode,
		accountingSetup: values.accountingSetupMode === "own"
			? createItemCategoryGeneratedAccountingSetup(name)
			: undefined,
		allowSubCategory: values.allowSubCategory,
		status: values.status,
		createdAt,
		createdBy: "Current User",
		updatedAt: createdAt,
		updatedBy: "Current User",
	};
}

export function updateItemCategoryRecord(
	record: ItemSetupRecord,
	values: ItemCategoryFormValues,
): ItemSetupRecord {
	const name = values.name.trim();

	return {
		...record,
		name,
		description: values.description.trim(),
		parentIds: values.parentId ? [values.parentId] : [],
		accountingSetupMode: values.accountingSetupMode,
		accountingSetup: values.accountingSetupMode === "own"
			? createItemCategoryGeneratedAccountingSetup(name)
			: undefined,
		allowSubCategory: values.allowSubCategory,
		status: values.status,
		updatedAt: new Date().toISOString(),
		updatedBy: "Current User",
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
		const accountingSetupMode = record.accountingSetupMode as
			| ItemCategoryAccountingSetupMode
			| "notSet";

		return accountingSetupMode === "notSet"
			? "inherit"
			: accountingSetupMode;
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

export function createItemCategoryGeneratedAccountingSetup(
	categoryName: string,
): ItemCategoryAccountingSetup {
	const accountName = categoryName.trim() || "New Category";

	return {
		inventoryAccount: `Inventory - ${accountName}`,
		salesAccount: `Sales - ${accountName}`,
		costOfSalesAccount: `Cost of Sales - ${accountName}`,
		expenseAccount: `Expense - ${accountName}`,
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
