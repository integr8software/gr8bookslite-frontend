export type ItemStatus = "Active" | "Inactive";

export type ItemSetupKind = "category" | "subcategory" | "type" | "subtype";

export type ItemTaxType = "VATable" | "VATIncluded";

export type ItemSetupRecord = {
	id: string;
	code: string;
	name: string;
	description: string;
	parentIds?: string[];
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

export type ItemSetupFormValues = {
	code: string;
	name: string;
	description: string;
	parentIds: string[];
	status: ItemStatus;
};

export type ItemFormErrors = Partial<
	Record<keyof ItemFormValues | "bundleComponents" | "suppliers", string>
>;

export type ItemSetupFormErrors = Partial<Record<keyof ItemSetupFormValues, string>>;

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

export type ItemSetupTableColumnKey =
	| "code"
	| "name"
	| "recordKindLabel"
	| "appliesToLabel"
	| "status";

export type ItemSetupTableRowData = {
	id: string;
	record: ItemSetupRecord;
	recordKind: ItemSetupKind;
	recordKindLabel: string;
	level: number;
	hasChildren: boolean;
	isVirtual?: boolean;
	appliesToLabel: string;
	parentRecord?: ItemSetupRecord;
};
