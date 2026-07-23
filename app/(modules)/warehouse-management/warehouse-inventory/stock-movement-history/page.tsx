import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function StockMovementHistoryPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Inventory"
			title="Stock Movement History"
			description="Review warehouse and location stock movement audit history."
			records={["Movement date", "Document type", "Source warehouse", "Destination warehouse", "Source location", "Destination location"]}
		/>
	);
}
