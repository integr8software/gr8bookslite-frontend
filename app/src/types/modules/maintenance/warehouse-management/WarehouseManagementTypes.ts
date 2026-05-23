export type WarehouseStatus = "Active" | "Inactive";

export type WarehouseAccessLevel = "Viewer" | "Picker" | "Manager";

export type WarehouseAccessRecord = {
	id: string;
	userName: string;
	role: string;
	accessLevel: WarehouseAccessLevel;
	status: WarehouseStatus;
};

export type WarehouseStockItem = {
	id: string;
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
	managerName: string;
	status: WarehouseStatus;
	address: string;
	contactNo: string;
	description: string;
	access: WarehouseAccessRecord[];
	items: WarehouseStockItem[];
};

export type WarehouseFormValues = {
	code: string;
	name: string;
	branchName: string;
	managerName: string;
	status: WarehouseStatus;
	address: string;
	contactNo: string;
	description: string;
};

export type WarehouseFormErrors = Partial<Record<keyof WarehouseFormValues, string>>;

export type WarehouseActionMode = "add" | "edit" | "view";

export type WarehouseDetailsTab = "information" | "access" | "items";

export type WarehouseTableColumnKey =
	| "code"
	| "name"
	| "branchName"
	| "managerName"
	| "status"
	| "itemCount";

