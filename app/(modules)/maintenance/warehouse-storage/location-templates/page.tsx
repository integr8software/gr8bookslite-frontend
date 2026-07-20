import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/maintenance/warehouse-management/WarehouseManagementModulePlanPage";

export default function LocationTemplatesPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Storage"
			title="Location Templates"
			description="Create reusable storage layouts that can generate real locations for selected warehouses."
			records={["Generate locations", "Copy warehouse structure", "Copy selected zones", "Auto-generate codes", "Apply default rules"]}
		/>
	);
}
