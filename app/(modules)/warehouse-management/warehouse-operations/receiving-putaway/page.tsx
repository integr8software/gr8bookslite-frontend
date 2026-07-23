import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function ReceivingPutawayPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Operations"
			title="Receiving & Putaway"
			description="Receive stock into a warehouse and assign final putaway locations."
			records={["Receiving document", "Warehouse", "Receiving location", "Putaway location", "Items", "Status"]}
		/>
	);
}
