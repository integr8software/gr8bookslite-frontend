import type {
	WarehouseFormValues,
	WarehouseRecord,
} from "@/app/src/types/modules/maintenance/warehouse-management/WarehouseManagementTypes";

export const MockWarehouses: WarehouseRecord[] = [
	{
		id: "warehouse-main",
		code: "WH-MAIN",
		name: "Main Warehouse",
		branchName: "Main Branch",
		managerName: "Maria Santos",
		status: "Active",
		address: "Makati City, Metro Manila",
		contactNo: "+63 2 8123 4567",
		description: "Primary receiving and storage location for standard stock.",
		access: [
			{
				id: "access-1",
				userName: "Maria Santos",
				role: "Warehouse Manager",
				accessLevel: "Manager",
				status: "Active",
			},
			{
				id: "access-2",
				userName: "Juan Dela Cruz",
				role: "Picker",
				accessLevel: "Picker",
				status: "Active",
			},
		],
		items: [
			{
				id: "stock-1",
				itemCode: "ITM-1001",
				itemName: "Office Paper A4",
				category: "Supplies",
				uom: "REAM",
				onHand: 420,
				allocated: 35,
			},
			{
				id: "stock-2",
				itemCode: "BND-2001",
				itemName: "Starter Office Bundle",
				category: "Bundles",
				uom: "SET",
				onHand: 18,
				allocated: 4,
			},
		],
	},
	{
		id: "warehouse-north",
		code: "WH-NORTH",
		name: "North Warehouse",
		branchName: "North Branch",
		managerName: "Leo Reyes",
		status: "Active",
		address: "Quezon City, Metro Manila",
		contactNo: "+63 2 8123 8899",
		description: "Distribution warehouse for north area transactions.",
		access: [
			{
				id: "access-3",
				userName: "Leo Reyes",
				role: "Warehouse Supervisor",
				accessLevel: "Manager",
				status: "Active",
			},
		],
		items: [
			{
				id: "stock-3",
				itemCode: "ITM-1002",
				itemName: "Thermal Receipt Roll",
				category: "Supplies",
				uom: "ROLL",
				onHand: 280,
				allocated: 20,
			},
		],
	},
];

export const WarehouseInitialFormValues: WarehouseFormValues = {
	code: "",
	name: "",
	branchName: "",
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
		branchName: warehouse.branchName,
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
		...values,
		access: [],
		items: [],
	};
}

export function updateWarehouseRecord(
	warehouse: WarehouseRecord,
	values: WarehouseFormValues,
): WarehouseRecord {
	return {
		...warehouse,
		...values,
	};
}

export function getWarehouseAvailableStock(item: {
	onHand: number;
	allocated: number;
}) {
	return item.onHand - item.allocated;
}

