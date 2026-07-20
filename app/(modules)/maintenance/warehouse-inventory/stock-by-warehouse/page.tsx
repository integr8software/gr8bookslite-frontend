import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function StockByWarehousePage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Inventory"
			title="Stock by Warehouse"
			description="View stock balances summarized by warehouse for accessible warehouses."
			records={["Warehouse", "Item count", "Quantity on hand", "Reserved quantity", "Available quantity", "Inventory value"]}
		/>
	);
}
