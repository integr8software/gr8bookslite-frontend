import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function StockAdjustmentPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Operations"
			title="Stock Adjustment"
			description="Adjust stock balances at warehouse or location level with reason and audit tracking."
			records={["Adjustment number", "Warehouse", "Location", "Item", "Quantity change", "Reason"]}
		/>
	);
}
