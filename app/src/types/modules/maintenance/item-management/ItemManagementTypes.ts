export type ItemStatus = "Active" | "Inactive";

export type ItemTrackingType = "Inventory" | "Non-Inventory" | "Service";

export type ItemSetupKind = "category" | "subcategory" | "type" | "subtype";

export type ItemSetupRecord = {
	id: string;
	code: string;
	name: string;
	description: string;
	status: ItemStatus;
};

export type ItemBundleComponent = {
	id: string;
	itemCode: string;
	itemName: string;
	quantity: number;
	uom: string;
};

export type ItemRecord = {
	id: string;
	code: string;
	name: string;
	category: string;
	subcategory: string;
	type: string;
	subtype: string;
	trackingType: ItemTrackingType;
	uom: string;
	status: ItemStatus;
	supportsBundle: boolean;
	description: string;
	bundleComponents: ItemBundleComponent[];
};

export type ItemFormValues = {
	code: string;
	name: string;
	category: string;
	subcategory: string;
	type: string;
	subtype: string;
	trackingType: ItemTrackingType;
	uom: string;
	status: ItemStatus;
	supportsBundle: boolean;
	description: string;
	bundleComponents: ItemBundleComponent[];
};

export type ItemSetupFormValues = {
	code: string;
	name: string;
	description: string;
	status: ItemStatus;
};

export type ItemFormErrors = Partial<
	Record<keyof ItemFormValues | "bundleComponents", string>
>;

export type ItemSetupFormErrors = Partial<Record<keyof ItemSetupFormValues, string>>;

export type ItemActionMode = "add" | "edit" | "view";

export type ItemTableColumnKey =
	| "code"
	| "name"
	| "category"
	| "type"
	| "trackingType"
	| "supportsBundle"
	| "status";

export type ItemSetupTableColumnKey = "code" | "name" | "status";

