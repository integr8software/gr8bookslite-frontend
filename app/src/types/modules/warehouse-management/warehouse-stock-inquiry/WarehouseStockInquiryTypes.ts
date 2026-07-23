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

export type WarehouseStockInquiryListRecord = {
	id: string;
	recordId: string;
	status: "Active";
	values: string[];
	warehouseId: string;
};
