import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function PickingDispatchPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Operations"
			title="Picking & Dispatch"
			description="Pick stock from warehouse locations and prepare it for dispatch."
			records={["Pick document", "Warehouse", "Picking location", "Dispatch area", "Items", "Status"]}
		/>
	);
}
