import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function StorageLayoutPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Storage"
			title="Storage Layout"
			description="Review the selected warehouse structure through hierarchy, rack, grid, and map views."
			records={["Warehouse selector", "Hierarchy view", "Rack or grid view", "Occupancy indicators", "Blocked locations"]}
		/>
	);
}
