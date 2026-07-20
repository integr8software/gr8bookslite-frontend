import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function ItemLocationSetupPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Storage"
			title="Item Location Setup"
			description="Assign item receiving, putaway, picking, reserve, return, damage, and quality hold locations per warehouse."
			records={["Default receiving", "Default putaway", "Primary picking", "Reserve location", "Returns location", "Quality hold"]}
		/>
	);
}
