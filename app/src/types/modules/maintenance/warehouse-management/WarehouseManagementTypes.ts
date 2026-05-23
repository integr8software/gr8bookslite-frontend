export type WarehouseStatus = "Active" | "Inactive";

export type WarehouseAccessLevel = "Viewer" | "Picker" | "Manager";

export type WarehouseAccessPermission =
	| "View Stock"
	| "Receive Stock"
	| "Issue Stock"
	| "Transfer Stock"
	| "Adjust Stock";

export type WarehouseBranchAvailability =
	| "Home Branch Only"
	| "Selected Branches"
	| "All Branches";

export type WarehouseAccessRecord = {
	id: string;
	userName: string;
	role: string;
	accessLevel: WarehouseAccessLevel;
	permissions: WarehouseAccessPermission[];
	status: WarehouseStatus;
};

export type WarehouseStockItem = {
	id: string;
	itemId: string;
	itemCode: string;
	itemName: string;
	category: string;
	uom: string;
	onHand: number;
	allocated: number;
};

export type WarehouseRecord = {
	id: string;
	code: string;
	name: string;
	branchName: string;
	availability: WarehouseBranchAvailability;
	availableBranches: string[];
	managerName: string;
	status: WarehouseStatus;
	address: string;
	contactNo: string;
	description: string;
	access: WarehouseAccessRecord[];
	items: WarehouseStockItem[];
};

export type WarehouseFormValues = {
	name: string;
	branchName: string;
	availability: WarehouseBranchAvailability;
	availableBranches: string[];
	managerName: string;
	status: WarehouseStatus;
	address: string;
	contactNo: string;
	description: string;
};

export type WarehouseFormErrors = Partial<Record<keyof WarehouseFormValues, string>>;

export type WarehouseAccessFormErrors = Record<
	string,
	Partial<Record<keyof WarehouseAccessRecord | "permissions", string>>
>;

export type WarehouseActionMode = "add" | "edit" | "view";

export type WarehouseTableColumnKey =
	| "name"
	| "branchName"
	| "availability"
	| "managerName"
	| "status";
