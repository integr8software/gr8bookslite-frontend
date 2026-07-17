import type { WarehouseStatus } from "@/app/src/types/modules/maintenance/warehouses/WarehouseTypes";

export type StorageLocationRecord = {
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

export type StorageLocationFormValues = {
	aisle: string;
	binNo: string;
	locationCode: string;
	rackNo: string;
	shelfNo: string;
	status: WarehouseStatus;
	warehouseId: string;
	zone: string;
};

export type StorageLocationListRecord = {
	id: string;
	recordId: string;
	status: WarehouseStatus;
	values: string[];
	warehouseId: string;
};
