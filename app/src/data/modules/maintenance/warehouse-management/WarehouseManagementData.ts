import type {
	WarehouseBranchAvailability,
	WarehouseFormValues,
	WarehouseRecord,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export const MockWarehouses: WarehouseRecord[] = [
	{
		id: "warehouse-main",
		code: "WH-MAIN",
		name: "Main Warehouse",
		type: "Main Warehouse",
		branchName: "Main Branch",
		availability: "All Branches",
		availableBranches: [],
		managerName: "Maria Santos",
		status: "Active",
		address: "Makati City, Metro Manila",
		contactNo: "+63 2 8123 4567",
		description: "Primary receiving and storage location for standard stock.",
		access: [
			{
				id: "access-1",
				userName: "Maria Santos",
				accessLevel: "Manager",
				permissions: [
					"View Stock",
					"Receive Stock",
					"Issue Stock",
					"Transfer Stock",
					"Adjust Stock",
				],
				status: "Active",
			},
			{
				id: "access-2",
				userName: "Juan Dela Cruz",
				accessLevel: "Picker",
				permissions: ["View Stock", "Issue Stock", "Transfer Stock"],
				status: "Active",
			},
		],
		items: [
			{
				id: "stock-1",
				itemId: "item-paper-a4",
				itemCode: "ITM-1001",
				itemName: "Office Paper A4",
				category: "Supplies",
				uom: "REAM",
				onHand: 420,
				reserved: 35,
				allocated: 35,
				lotNumber: "LOT-A4-2026-01",
				serialNumber: "",
				storageLocation: "WH-A-Z1-R01-S02-B03",
				unitCost: 190,
			},
			{
				id: "stock-2",
				itemId: "item-starter-bundle",
				itemCode: "BND-2001",
				itemName: "Starter Office Bundle",
				category: "Bundles",
				uom: "SET",
				onHand: 18,
				reserved: 4,
				allocated: 4,
				lotNumber: "",
				serialNumber: "",
				storageLocation: "WH-A-Z1-R02-S01-B01",
				unitCost: 1850,
			},
		],
		locations: [
			{
				id: "loc-main-a",
				warehouseId: "warehouse-main",
				warehouseName: "Main Warehouse",
				zone: "Zone A",
				aisle: "Aisle 1",
				rackNo: "R01",
				shelfNo: "S02",
				binNo: "B03",
				locationCode: "WH-A-Z1-R01-S02-B03",
				status: "Active",
			},
			{
				id: "loc-main-b",
				warehouseId: "warehouse-main",
				warehouseName: "Main Warehouse",
				zone: "Zone A",
				aisle: "Aisle 1",
				rackNo: "R02",
				shelfNo: "S01",
				binNo: "B01",
				locationCode: "WH-A-Z1-R02-S01-B01",
				status: "Active",
			},
		],
		movements: [
			{
				id: "move-main-1",
				date: "2026-06-10",
				referenceNumber: "GR-000128",
				transactionType: "Goods Receipt",
				item: "Office Paper A4",
				quantityIn: 120,
				quantityOut: 0,
				balance: 420,
				user: "Maria Santos",
			},
			{
				id: "move-main-2",
				date: "2026-06-11",
				referenceNumber: "GI-000077",
				transactionType: "Goods Issue",
				item: "Starter Office Bundle",
				quantityIn: 0,
				quantityOut: 2,
				balance: 18,
				user: "Juan Dela Cruz",
			},
		],
		transfers: [
			{
				id: "transfer-main-1",
				date: "2026-06-12",
				referenceNumber: "WT-000014",
				sourceWarehouse: "Main Warehouse",
				destinationWarehouse: "North Warehouse",
				status: "In Transit",
				requestedBy: "Maria Santos",
				approvedBy: "Leo Reyes",
			},
		],
	},
	{
		id: "warehouse-north",
		code: "WH-NORTH",
		name: "North Warehouse",
		type: "Distribution Center",
		branchName: "North Branch",
		availability: "Selected Branches",
		availableBranches: ["Main Branch", "North Branch"],
		managerName: "Leo Reyes",
		status: "Active",
		address: "Quezon City, Metro Manila",
		contactNo: "+63 2 8123 8899",
		description: "Distribution warehouse for north area transactions.",
		access: [
			{
				id: "access-3",
				userName: "Leo Reyes",
				accessLevel: "Manager",
				permissions: [
					"View Stock",
					"Receive Stock",
					"Issue Stock",
					"Transfer Stock",
				],
				status: "Active",
			},
		],
		items: [
			{
				id: "stock-3",
				itemId: "item-thermal-roll",
				itemCode: "ITM-1002",
				itemName: "Thermal Receipt Roll",
				category: "Supplies",
				uom: "ROLL",
				onHand: 280,
				reserved: 20,
				allocated: 20,
				lotNumber: "LOT-TR-2026-02",
				serialNumber: "",
				storageLocation: "WH-N-Z1-R01-S01-B02",
				unitCost: 35,
			},
		],
		locations: [
			{
				id: "loc-north-a",
				warehouseId: "warehouse-north",
				warehouseName: "North Warehouse",
				zone: "Zone 1",
				aisle: "Aisle 1",
				rackNo: "R01",
				shelfNo: "S01",
				binNo: "B02",
				locationCode: "WH-N-Z1-R01-S01-B02",
				status: "Active",
			},
		],
		movements: [
			{
				id: "move-north-1",
				date: "2026-06-09",
				referenceNumber: "GR-000119",
				transactionType: "Goods Receipt",
				item: "Thermal Receipt Roll",
				quantityIn: 80,
				quantityOut: 0,
				balance: 280,
				user: "Leo Reyes",
			},
		],
		transfers: [],
	},
];

export const WarehouseInitialFormValues: WarehouseFormValues = {
	code: "",
	name: "",
	availableBranches: [],
	managerName: "",
	status: "Active",
	address: "",
	contactNo: "",
	description: "",
};

export function createWarehouseFormValues(
	warehouse: WarehouseRecord,
): WarehouseFormValues {
	return {
		code: warehouse.code,
		name: warehouse.name,
		availableBranches: warehouse.availableBranches,
		managerName: warehouse.managerName,
		status: warehouse.status,
		address: warehouse.address,
		contactNo: warehouse.contactNo,
		description: warehouse.description,
	};
}

export function createWarehouseRecord(
	values: WarehouseFormValues,
): WarehouseRecord {
	return {
		id: `warehouse-${Date.now()}`,
		code: values.code.trim() || createWarehouseCode(values.name),
		...createWarehouseRecordFields(values),
		access: [],
		items: [],
		locations: [],
		movements: [],
		transfers: [],
	};
}

export function updateWarehouseRecord(
	warehouse: WarehouseRecord,
	values: WarehouseFormValues,
): WarehouseRecord {
	return {
		...warehouse,
		code: values.code.trim() || warehouse.code,
		...createWarehouseRecordFields(values),
	};
}

export function getWarehouseAvailableStock(item: {
	onHand: number;
	allocated?: number;
	reserved?: number;
}) {
	return item.onHand - (item.reserved ?? item.allocated ?? 0);
}

export function getWarehouseAvailableBranchLabel(warehouse: {
	availability?: WarehouseBranchAvailability;
	availableBranches: string[];
	branchName?: string;
}) {
	if (warehouse.availability === "All Branches") {
		return "All branches";
	}

	if (warehouse.availability === "Home Branch Only") {
		return warehouse.branchName || "Home branch";
	}

	return warehouse.availableBranches.length > 0
		? warehouse.availableBranches.join(", ")
		: "No branches selected";
}

function createWarehouseRecordFields(values: WarehouseFormValues) {
	const availableBranches = normalizeWarehouseAvailableBranches(values);
	const branchName = availableBranches[0] ?? "";

	return {
		name: values.name,
		type: "Warehouse",
		branchName,
		availability: getWarehouseAvailability(availableBranches),
		availableBranches,
		managerName: values.managerName,
		status: values.status,
		address: values.address,
		contactNo: values.contactNo,
		description: values.description,
	};
}

function normalizeWarehouseAvailableBranches(values: WarehouseFormValues) {
	return Array.from(
		new Set(values.availableBranches.filter((branchName) => branchName.trim())),
	);
}

function getWarehouseAvailability(
	availableBranches: string[],
): WarehouseBranchAvailability {
	if (availableBranches.length === 0) {
		return "Selected Branches";
	}

	if (availableBranches.length === 1) {
		return "Home Branch Only";
	}

	return "Selected Branches";
}

function createWarehouseCode(name: string) {
	const normalizedName = name
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, "-")
		.replace(/^-|-$/g, "");

	return normalizedName ? `WH-${normalizedName.slice(0, 18)}` : `WH-${Date.now()}`;
}
