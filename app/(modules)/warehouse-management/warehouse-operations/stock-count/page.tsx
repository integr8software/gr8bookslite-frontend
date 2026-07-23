import { WarehouseManagementModulePlanPage } from "@/app/src/ui/modules/warehouse-management/warehouse-management/WarehouseManagementModulePlanPage";

export default function StockCountPage() {
	return (
		<WarehouseManagementModulePlanPage
			group="Warehouse Operations"
			title="Stock Count"
			description="Count stock by warehouse and storage location."
			records={["Count sheet", "Warehouse", "Location scope", "System quantity", "Counted quantity", "Variance"]}
		/>
	);
}
