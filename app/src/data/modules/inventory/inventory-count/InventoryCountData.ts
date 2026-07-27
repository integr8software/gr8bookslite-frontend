import type {
	InventoryCountLine,
	InventoryCountRecord,
	InventoryCountValues,
} from "@/app/src/types/modules/inventory/inventory-count/InventoryCountTypes";

export const InventoryCountRecords: InventoryCountRecord[] = [
	{
		id: "inc-001",
		countNo: "INC-2026-0001",
		countDate: "2026-07-12",
		warehouse: "Main Warehouse",
		uploader: "Maria Santos",
		category: "Finished Goods",
		totalItems: 128,
		variance: "-3.00",
		status: "Approved",
	},
	{
		id: "inc-002",
		countNo: "INC-2026-0002",
		countDate: "2026-07-15",
		warehouse: "Cebu Warehouse",
		uploader: "Juan Dela Cruz",
		category: "Raw Materials",
		totalItems: 86,
		variance: "0.00",
		status: "In Progress",
	},
	{
		id: "inc-003",
		countNo: "INC-2026-0003",
		countDate: "2026-07-17",
		warehouse: "Davao Warehouse",
		uploader: "Ana Reyes",
		category: "Packaging",
		totalItems: 42,
		variance: "5.00",
		status: "Draft",
	},
];

export function createInitialInventoryCountValues(): InventoryCountValues {
	return {
		countNo: "INC-2026-0004",
		countDate: "2026-07-17",
		warehouse: "8 | Laguna",
		uploader: "Maria Santos",
		itemType: "ALL",
		category: "ALL",
		itemGroup: "ALL",
		counter: "",
		status: "Draft",
		remarks: "",
		lines: [
			createInventoryCountLine({
				itemCode: "IM0006",
				itemName: "MESH 325",
				uom: "Bags",
				systemQty: "5.00",
				countQty: "",
			}),
			createInventoryCountLine({
				itemCode: "IM0007",
				itemName: "MESH 20",
				uom: "Bags",
				systemQty: "0.00",
				countQty: "",
			}),
			createInventoryCountLine({
				itemCode: "IM0008",
				itemName: "MESH 30",
				uom: "Bags",
				systemQty: "0.00",
				countQty: "",
			}),
		],
		uploadHistory: [
			{
				id: "upload-history-001",
				countNo: "INC-2026-0004",
				uploadedAt: "2026-07-17 09:18",
				uploader: "Maria Santos",
				fileName: "inventory-count-main-warehouse.xlsx",
				rowCount: 3,
				status: "Uploaded",
			},
		],
	};
}

export function createInventoryCountLine(
	overrides: Partial<InventoryCountLine> = {},
): InventoryCountLine {
	return recalculateInventoryCountLine({
		id: `inc-line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
		itemCode: "",
		itemName: "",
		uom: "",
		systemQty: "0.00",
		countQty: "",
		variance: "0.00",
		remarks: "",
		...overrides,
	});
}

export function recalculateInventoryCountLine(
	line: InventoryCountLine,
): InventoryCountLine {
	const systemQty = Number.parseFloat(line.systemQty) || 0;
	const countQty = Number.parseFloat(line.countQty) || 0;

	return {
		...line,
		variance: line.countQty.trim() ? (countQty - systemQty).toFixed(2) : "",
	};
}
