import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function LocationTransferPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Operations"
			title="Location Transfer"
			description="Move stock between storage locations inside the same warehouse."
			records={["Transfer number", "Warehouse", "From location", "To location", "Items", "Status"]}
		/>
	);
}
