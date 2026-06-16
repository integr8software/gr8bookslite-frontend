export type WarehouseStatus = "Active" | "Inactive";

export type WarehouseAccessLevel = "Viewer" | "Picker" | "Manager";

export type WarehouseAccessPermission =
	| "View Stock"
	| "Receive Stock"
	| "Issue Stock"
	| "Transfer Stock"
	| "Adjust Stock"
	| "Manage Locations"
	| "View History";

export type WarehouseBranchAvailability =
	| "Home Branch Only"
	| "Selected Branches"
	| "All Branches";

export type WarehouseAccessRecord = {
	id: string;
	userName: string;
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
	reserved: number;
	allocated: number;
	lotNumber: string;
	serialNumber: string;
	storageLocation: string;
	unitCost: number;
};

export type WarehouseStorageLocation = {
	id: string;
	warehouseId: string;
	warehouseName: string;
	zone: string;
	aisle: string;
	rackNo: string;
	shelfNo: string;
	binNo: string;
	locationCode: string;
	status: WarehouseStatus;
};

export type WarehouseStockMovement = {
	id: string;
	date: string;
	referenceNumber: string;
	transactionType: string;
	item: string;
	quantityIn: number;
	quantityOut: number;
	balance: number;
	user: string;
};

export type WarehouseTransfer = {
	id: string;
	date: string;
	referenceNumber: string;
	sourceWarehouse: string;
	destinationWarehouse: string;
	status: string;
	requestedBy: string;
	approvedBy: string;
};

export type WarehouseRecord = {
	id: string;
	code: string;
	name: string;
	type: string;
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
	locations: WarehouseStorageLocation[];
	movements: WarehouseStockMovement[];
	transfers: WarehouseTransfer[];
};

export type WarehouseFormValues = {
	code: string;
	name: string;
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
	| "code"
	| "name"
	| "availableBranchLabel"
	| "managerName"
	| "totalItems"
	| "inventoryValue"
	| "status";

export type WarehouseTableRecord = WarehouseRecord & {
	availableBranchLabel: string;
	totalItems: number;
	inventoryValue: number;
};
