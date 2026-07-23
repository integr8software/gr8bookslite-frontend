import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function LocationAvailabilityPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Storage"
			title="Location Availability"
			description="Manage operational location availability without changing the warehouse master status."
			records={["Available", "Reserved", "Blocked", "Under maintenance", "Quality hold", "Inactive"]}
		/>
	);
}
