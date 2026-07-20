import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function ItemAvailabilityPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Inventory"
			title="Item Availability"
			description="View available, reserved, blocked, and quality-hold quantities across warehouses and locations."
			records={["Item", "Warehouse", "Location", "On hand", "Reserved", "Available"]}
		/>
	);
}
