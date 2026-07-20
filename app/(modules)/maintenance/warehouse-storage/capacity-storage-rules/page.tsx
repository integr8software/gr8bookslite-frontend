import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function CapacityStorageRulesPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Storage"
			title="Capacity & Storage Rules"
			description="Maintain capacity, restriction, and override rules from warehouse level down to bin level."
			records={["Warehouse rules", "Zone overrides", "Rack overrides", "Bin overrides", "Capacity thresholds", "Mixed-item rules"]}
		/>
	);
}
