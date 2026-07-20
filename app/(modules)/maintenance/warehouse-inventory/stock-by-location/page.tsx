import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function StockByLocationPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Inventory"
			title="Stock by Location"
			description="View stock balances by warehouse storage location."
			records={["Warehouse selector", "Location", "Item", "Lot or serial", "Quantity on hand", "Availability"]}
		/>
	);
}
