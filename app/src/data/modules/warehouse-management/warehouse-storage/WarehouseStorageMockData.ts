import type { WarehouseStockItem } from "@/app/src/types/modules/warehouse-management/warehouse-stock-inquiry/WarehouseStockInquiryTypes";
import type { WarehouseStorageRecord } from "@/app/src/types/modules/warehouse-management/warehouse-storage/WarehouseStorageTypes";
import type { WarehouseRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseTypes";

export function createWarehouseStorageDemoWarehouses(warehouses: WarehouseRecord[]) {
	const sourceWarehouses = warehouses.length > 0 ? warehouses : createFallbackDemoWarehouses();

	return sourceWarehouses.map((warehouse, index) => {
		if (warehouse.locations.length > 0 || warehouse.items.length > 0) {
			return warehouse;
		}

		const locations = createDemoLocations(warehouse, index);
		const items = createDemoItems(locations);

		return {
			...warehouse,
			items,
			locations,
		};
	});
}

function createDemoLocations(warehouse: WarehouseRecord, warehouseIndex: number): WarehouseStorageRecord[] {
	if (warehouseIndex === 1) {
		return [
			createLocation(warehouse, "loc-freezer-01", {
				capacity: "500",
				capacityUom: "kg",
				locationCode: "FREEZER-01",
				locationName: "Freezer 1",
				locationType: "Cold Storage",
				notes: "Frozen and temperature-sensitive goods.",
				room: "Freezer Room",
				status: "Active",
				temperatureZone: "-18C",
			}),
			createLocation(warehouse, "loc-chiller-01", {
				capacity: "300",
				capacityUom: "kg",
				locationCode: "CHILLER-01",
				locationName: "Chiller Area",
				locationType: "Cold Storage",
				notes: "For chilled goods and short-term holding.",
				room: "Chiller",
				status: "Reserved",
				temperatureZone: "2C to 8C",
			}),
			createLocation(warehouse, "loc-receiving", {
				locationCode: "RCV-AREA",
				locationName: "Receiving Area",
				locationType: "Receiving",
				notes: "Temporary staging for incoming items.",
				status: "Active",
			}),
		];
	}

	if (warehouseIndex === 2) {
		return [
			createLocation(warehouse, "loc-back-room", {
				locationCode: "BR-01",
				locationName: "Back Room",
				locationType: "General Storage",
				notes: "Simple stockroom location for branch inventory.",
				status: "Active",
			}),
			createLocation(warehouse, "loc-display", {
				locationCode: "DISPLAY-01",
				locationName: "Display Shelf",
				locationType: "Display",
				status: "Active",
			}),
			createLocation(warehouse, "loc-damage", {
				locationCode: "HOLD-01",
				locationName: "Hold / Damaged Items",
				locationType: "General Storage",
				notes: "Blocked from normal picking.",
				status: "Blocked",
			}),
		];
	}

	return [
		createLocation(warehouse, "loc-a01-r01-l01-b01", {
			aisle: "01",
			binNo: "01",
			capacity: "1000",
			capacityUom: "kg",
			locationCode: "A01-R01-L01-B01",
			locationName: "Fast-moving goods bin",
			locationType: "Picking",
			notes: "Default picking bin for fast-moving SKUs.",
			rackNo: "01",
			shelfNo: "01",
			status: "Active",
			zone: "A",
		}),
		createLocation(warehouse, "loc-a01-r01-l02-b02", {
			aisle: "01",
			binNo: "02",
			capacity: "800",
			capacityUom: "kg",
			locationCode: "A01-R01-L02-B02",
			locationName: "Reserve pallet slot",
			locationType: "Pallet",
			rackNo: "01",
			shelfNo: "02",
			status: "Reserved",
			zone: "A",
		}),
		createLocation(warehouse, "loc-b02-r03-l01-b01", {
			aisle: "02",
			binNo: "01",
			capacity: "600",
			capacityUom: "cases",
			locationCode: "B02-R03-L01-B01",
			locationName: "Case storage",
			locationType: "Case",
			rackNo: "03",
			shelfNo: "01",
			status: "Active",
			zone: "B",
		}),
		createLocation(warehouse, "loc-blocked-01", {
			aisle: "03",
			binNo: "01",
			locationCode: "QA-HOLD-01",
			locationName: "Quality hold",
			locationType: "General Storage",
			notes: "Blocked until inventory control releases the stock.",
			rackNo: "01",
			shelfNo: "Ground",
			status: "Blocked",
			zone: "QA",
		}),
	];
}

function createLocation(
	warehouse: WarehouseRecord,
	id: string,
	values: Partial<WarehouseStorageRecord> & Pick<WarehouseStorageRecord, "locationCode" | "locationName" | "locationType" | "status">,
): WarehouseStorageRecord {
	return {
		aisle: values.aisle ?? "",
		binNo: values.binNo ?? "",
		capacity: values.capacity,
		capacityUom: values.capacityUom,
		id,
		locationCode: values.locationCode,
		locationName: values.locationName,
		locationType: values.locationType,
		notes: values.notes,
		rackNo: values.rackNo ?? "",
		room: values.room,
		shelfNo: values.shelfNo ?? "",
		status: values.status,
		temperatureZone: values.temperatureZone,
		warehouseId: warehouse.id,
		warehouseName: warehouse.name,
		zone: values.zone ?? "",
	};
}

function createDemoItems(locations: WarehouseStorageRecord[]): WarehouseStockItem[] {
	const firstLocation = locations[0];
	const secondLocation = locations[1] ?? locations[0];
	const thirdLocation = locations[2] ?? locations[0];

	return [
		createItem("item-001", "SKU-COFFEE-250G", "Premium Coffee 250g", "Grocery", "pack", 120, 18, firstLocation.locationCode, 140),
		createItem("item-002", "SKU-RICE-5KG", "Jasmine Rice 5kg", "Grocery", "bag", 64, 8, firstLocation.locationCode, 320),
		createItem("item-003", "SKU-MILK-1L", "Fresh Milk 1L", "Dairy", "carton", 42, 6, secondLocation.locationCode, 92),
		createItem("item-004", "SKU-CAN-001", "Canned Tuna", "Canned Goods", "case", 28, 4, thirdLocation.locationCode, 880),
	];
}

function createItem(
	id: string,
	itemCode: string,
	itemName: string,
	category: string,
	uom: string,
	onHand: number,
	reserved: number,
	storageLocation: string,
	unitCost: number,
): WarehouseStockItem {
	return {
		allocated: 0,
		category,
		id,
		itemCode,
		itemId: id,
		itemName,
		lotNumber: "",
		onHand,
		reserved,
		serialNumber: "",
		storageLocation,
		unitCost,
		uom,
	};
}

function createFallbackDemoWarehouses(): WarehouseRecord[] {
	return [
		createWarehouse("demo-wh-main", "WH-MAIN", "Main Warehouse", "Head Office"),
		createWarehouse("demo-wh-cold", "WH-COLD", "Cold Storage", "Head Office"),
		createWarehouse("demo-wh-branch", "WH-BRANCH", "Branch Stockroom", "Branch"),
	];
}

function createWarehouse(id: string, code: string, name: string, branchName: string): WarehouseRecord {
	return {
		access: [],
		address: "",
		availability: "All Branches",
		availableBranches: [branchName],
		branchAvailabilityMode: "All Branches",
		branchName,
		branchUnitIds: [],
		code,
		contactNo: "",
		createdAt: null,
		createdBy: null,
		description: "Demo warehouse for warehouse storage setup.",
		id,
		items: [],
		locations: [],
		managerName: "",
		movements: [],
		name,
		status: "Active",
		transfers: [],
		updatedAt: null,
		updatedBy: null,
	};
}
