export type WarehouseStorageStatus = "Active" | "Inactive" | "Blocked" | "Reserved";

export type WarehouseStorageTrackingMode = "No Tracking" | "Simple" | "Structured" | "Custom";

export type WarehouseCapacityTrackingMode = "Off" | "Optional" | "Required";

export type WarehouseTemperatureTrackingMode = "Off" | "Optional" | "Required";

export type WarehouseStorageSetup = {
	capacityTracking: WarehouseCapacityTrackingMode;
	codeFormat: string;
	defaultLocationRequired: boolean;
	requiredFields: WarehouseStorageStructureField[];
	temperatureTracking: WarehouseTemperatureTrackingMode;
	trackingMode: WarehouseStorageTrackingMode;
};

export type WarehouseStorageStructureField =
	| "zone"
	| "room"
	| "aisle"
	| "rackNo"
	| "shelfNo"
	| "binNo"
	| "temperatureZone";

export type WarehouseStorageRecord = {
	id: string;
	warehouseId: string;
	warehouseName: string;
	capacity?: string;
	capacityUom?: string;
	zone: string;
	room?: string;
	aisle: string;
	rackNo: string;
	shelfNo: string;
	binNo: string;
	locationCode: string;
	locationName?: string;
	locationType?: string;
	notes?: string;
	status: WarehouseStorageStatus;
	temperatureZone?: string;
};

export type WarehouseStorageFormValues = {
	aisle: string;
	binNo: string;
	capacity?: string;
	capacityUom?: string;
	locationCode: string;
	locationName?: string;
	locationType?: string;
	notes?: string;
	rackNo: string;
	room?: string;
	shelfNo: string;
	status: WarehouseStorageStatus;
	temperatureZone?: string;
	warehouseId: string;
	zone: string;
};

export type WarehouseStorageListRecord = {
	id: string;
	itemCount: number;
	itemsOnHand: number;
	location: WarehouseStorageRecord;
	path: string;
	recordId: string;
	status: WarehouseStorageStatus;
	values: string[];
	warehouseId: string;
};

export type WarehouseStorageShortcutArea = {
	icon: import("lucide-react").LucideIcon;
	label: string;
	targetRecord?: WarehouseStorageListRecord;
};

export type WarehouseStorageLayoutSlot = {
	aisle: string;
	bin: string;
	id: string;
	label: string;
	rack: string;
	record?: WarehouseStorageListRecord;
	shelf: string;
	status: WarehouseStorageStatus | "Occupied" | "Full" | "Maintenance";
};

export type WarehouseStorageActionMode = "add" | "edit" | "view";

export type WarehouseStorageDrawerState =
	| {
			mode: WarehouseStorageActionMode;
			record?: WarehouseStorageListRecord;
	  }
	| null;
