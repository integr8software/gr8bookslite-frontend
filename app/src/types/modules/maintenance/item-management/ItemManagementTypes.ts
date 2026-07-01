export type ItemStatus = "Active" | "Inactive";

export type ItemSetupKind = "category" | "subcategory" | "type" | "subtype";

export type ItemTaxTreatment =
	| "VAT Exclusive"
	| "VAT Inclusive"
	| "VAT Exempt"
	| "Zero Rated"
	| "Non-VAT";

export type ItemPerishability = "Perishable" | "Non Perishable";

export type ItemCategoryAccountingSetupStatus =
	| "Configured"
	| "Inherited"
	| "Override"
	| "Not Set";

export type ItemCategoryAccountingSetupMode = "inherit" | "notSet" | "own";

export type ItemCategoryAccountingSetup = {
	inventoryAccount: string;
	salesAccount: string;
	costOfSalesAccount: string;
	discountAccount: string;
	purchaseAccount: string;
	expenseAccount: string;
};

export type ItemSetupRecord = {
	id: string;
	code: string;
	name: string;
	description: string;
	parentIds?: string[];
	accountingSetupMode?: ItemCategoryAccountingSetupMode;
	accountingSetup?: Partial<ItemCategoryAccountingSetup>;
	allowSubCategory?: boolean;
	parentInactiveSourceIds?: string[];
	statusBeforeParentInactive?: ItemStatus;
	status: ItemStatus;
};

export type ItemBundleComponent = {
	id: string;
	itemId: string;
	itemCode: string;
	itemName: string;
	quantity: number;
	uom: string;
};

export type ItemBundleComponentItemOption = {
	id: string;
	itemCode: string;
	itemName: string;
	itemUom: string;
	uomOptions: string[];
};

export type ItemBundleLine = {
	id: string;
	itemId: string;
	quantity: number;
};

export type ItemBundleRecord = {
	id: string;
	bundlePrice: number;
	code: string;
	lines: ItemBundleLine[];
	name: string;
	status: ItemStatus;
};

export type ItemSupplierAssignment = {
	id: string;
	supplier: string;
	supplierItemCode: string;
	leadTime: string;
	lastCost: number;
	isDefault: boolean;
};

export type ItemSupplierRecord = {
	id: string;
	code: string;
	name: string;
	contactPerson: string;
	contactDetails: string;
	status: ItemStatus;
};

export type ItemUomConversion = {
	id: string;
	fromUom: string;
	quantity: number;
	toUom: string;
	priceBasis?: "Source" | "Target";
	barcode?: string;
	isPurchaseDefault?: boolean;
	isSalesDefault?: boolean;
	isStockDefault?: boolean;
};

export type ItemAttributeUsage = "Variant" | "Stock Classification" | "Item Detail";

export type ItemAttributeRecord = {
	id: string;
	code: string;
	name: string;
	usage: ItemAttributeUsage;
	values: string[];
	requiredOnItem: boolean;
	affectsStock: boolean;
	status: ItemStatus;
};

export type ItemAttributeAssignment = {
	id: string;
	attributeId: string;
	value: string;
};

export type ItemPriceListRecord = {
	id: string;
	code: string;
	name: string;
	currency: string;
	customerType: string;
	pricingMode: "Manual" | "Cost Markup" | "Discount From Retail";
	markupPercent: number;
	status: ItemStatus;
};

export type ItemPriceListAssignment = {
	id: string;
	priceListId: string;
	price: number;
};

export type ItemRecord = {
	id: string;
	code: string;
	skuCode: string;
	name: string;
	model: string;
	externalReferenceCode: string;
	brand: string;
	supplier: string;
	suppliers: ItemSupplierAssignment[];
	barcode: string;
	category: string;
	subcategory?: string;
	type?: string;
	subtype?: string;
	primaryCategory: string;
	categories: string[];
	uom: string;
	responsibilityCenter: string;
	costPrice: number;
	sellingPrice: number;
	taxTreatment: ItemTaxTreatment;
	status: ItemStatus;
	defaultWarehouse: string;
	defaultLocation: string;
	defaultZone: string;
	defaultRack: string;
	defaultShelf: string;
	defaultBin: string;
	defaultLotNo: string;
	leadTime: string;
	reorderLevel: number;
	minimumStock: number;
	maximumStock: number;
	perishability: ItemPerishability;
	sellable: boolean;
	purchasable: boolean;
	trackInventory: boolean;
	service: boolean;
	asset: boolean;
	hasVariants: boolean;
	lotTracking: boolean;
	serialTracking: boolean;
	attributeAssignments: ItemAttributeAssignment[];
	uomConversions: ItemUomConversion[];
	priceListPrices: ItemPriceListAssignment[];
	description: string;
	tags: string[];
};

export type ItemFormValues = {
	code: string;
	skuCode: string;
	name: string;
	model: string;
	externalReferenceCode: string;
	brand: string;
	suppliers: ItemSupplierAssignment[];
	barcode: string;
	primaryCategory: string;
	uom: string;
	responsibilityCenter: string;
	costPrice: number;
	sellingPrice: number;
	taxTreatment: ItemTaxTreatment;
	status: ItemStatus;
	defaultWarehouse: string;
	defaultLocation: string;
	defaultZone: string;
	defaultRack: string;
	defaultShelf: string;
	defaultBin: string;
	defaultLotNo: string;
	leadTime: string;
	reorderLevel: number;
	minimumStock: number;
	maximumStock: number;
	perishability: ItemPerishability;
	sellable: boolean;
	purchasable: boolean;
	trackInventory: boolean;
	service: boolean;
	asset: boolean;
	hasVariants: boolean;
	lotTracking: boolean;
	serialTracking: boolean;
	attributeAssignments: ItemAttributeAssignment[];
	uomConversions: ItemUomConversion[];
	priceListPrices: ItemPriceListAssignment[];
	description: string;
	tags: string[];
};

export type ItemCategoryClassificationFormValues = {
	name: string;
	parentId: string;
	description: string;
	accountingSetupMode: ItemCategoryAccountingSetupMode;
	accountingSetup: ItemCategoryAccountingSetup;
	allowSubCategory: boolean;
	status: ItemStatus;
};

export type ItemFormErrors = Partial<
	Record<keyof ItemFormValues | "suppliers", string>
>;

export type ItemCategoryClassificationFormErrors = Partial<
	Record<
		| keyof ItemCategoryClassificationFormValues
		| keyof ItemCategoryAccountingSetup,
		string
	>
>;

export type ItemActionMode = "add" | "edit" | "view";

export type ItemTableColumnKey =
	| "code"
	| "skuCode"
	| "name"
	| "category"
	| "uom"
	| "costPrice"
	| "sellingPrice"
	| "status";

export type ItemCategoryClassificationTableColumnKey =
	| "name"
	| "parentName"
	| "accountingSetupStatus"
	| "status";

export type ItemCategoryClassificationTableRowData = {
	id: string;
	record: ItemSetupRecord;
	recordKind: ItemSetupKind;
	recordKindLabel: string;
	level: number;
	hasChildren: boolean;
	parentId: string;
	parentName: string;
	pathName: string;
	accountingSetupStatus: ItemCategoryAccountingSetupStatus;
	effectiveAccountingSetup?: ItemCategoryAccountingSetup;
	hasInactiveAncestor?: boolean;
	inheritedAccountingSourceName?: string;
	isVirtual?: boolean;
	usedByItemCount: number;
};
