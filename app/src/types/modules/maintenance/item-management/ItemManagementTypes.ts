export type ItemStatus = "Active" | "Inactive";

export type ItemSetupKind = "category" | "subcategory" | "type" | "subtype";

export type ItemTaxType = "VATable" | "VATIncluded";

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

export type ItemSupplierAssignment = {
	id: string;
	supplier: string;
	isDefault: boolean;
};

export type ItemUomConversion = {
	id: string;
	fromUom: string;
	quantity: number;
	toUom: string;
};

export type ItemRecord = {
	id: string;
	code: string;
	skuCode: string;
	name: string;
	thirdPartyCode: string;
	brand: string;
	supplier: string;
	suppliers: ItemSupplierAssignment[];
	barcode: string;
	category: string;
	subcategory: string;
	type: string;
	subtype: string;
	uom: string;
	costPrice: number;
	sellingPrice: number;
	taxType?: ItemTaxType;
	isVatable: boolean;
	isVatIncluded: boolean;
	status: ItemStatus;
	defaultWarehouse: string;
	supportsBundle: boolean;
	description: string;
	tags: string[];
	uomConversions: ItemUomConversion[];
	bundleComponents: ItemBundleComponent[];
};

export type ItemFormValues = {
	code: string;
	skuCode: string;
	name: string;
	thirdPartyCode: string;
	brand: string;
	suppliers: ItemSupplierAssignment[];
	barcode: string;
	category: string;
	subcategory: string;
	type: string;
	subtype: string;
	uom: string;
	costPrice: number;
	sellingPrice: number;
	isVatable: boolean;
	isVatIncluded: boolean;
	status: ItemStatus;
	defaultWarehouse: string;
	supportsBundle: boolean;
	description: string;
	tags: string[];
	uomConversions: ItemUomConversion[];
	bundleComponents: ItemBundleComponent[];
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
	Record<keyof ItemFormValues | "bundleComponents" | "suppliers", string>
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
	| "type"
	| "uom"
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
