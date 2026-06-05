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
				role: "Warehouse Manager",
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
				role: "Picker",
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
				allocated: 35,
			},
			{
				id: "stock-2",
				itemId: "item-starter-bundle",
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
				role: "Warehouse Supervisor",
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
				allocated: 20,
			},
		],
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
	allocated: number;
}) {
	return item.onHand - item.allocated;
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
