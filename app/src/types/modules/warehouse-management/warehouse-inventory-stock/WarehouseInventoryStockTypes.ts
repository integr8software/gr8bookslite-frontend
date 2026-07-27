export type WarehouseInventoryStockItem = {
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

export type WarehouseInventoryStockMovement = {
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

export type WarehouseInventoryStockListRecord = {
	id: string;
	recordId: string;
	status: "Active";
	values: string[];
	warehouseId: string;
};
