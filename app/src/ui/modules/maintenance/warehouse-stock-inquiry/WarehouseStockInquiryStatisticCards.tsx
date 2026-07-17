import { CheckCircle2, PackageSearch, Search, Warehouse } from "lucide-react";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseStockInquiryStatisticCardsProps = {
	isLoading: boolean;
	records: WarehouseModuleRecord[];
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseStockInquiryStatisticCards({
	isLoading,
	records,
	statistics,
}: WarehouseStockInquiryStatisticCardsProps) {
	return (
		<ModuleStatisticCards
			isLoading={isLoading}
			items={[
				{
					helper: "Stock rows",
					icon: Search,
					label: "Total Records",
					value: statistics.totalRecords,
				},
				{
					helper: "Available to inspect",
					icon: CheckCircle2,
					label: "Active",
					tone: "emerald",
					value: statistics.activeRecords,
				},
				{
					helper: "Inventory items",
					icon: PackageSearch,
					label: "Stock Lines",
					tone: "cyan",
					value: statistics.totalRecords,
				},
				{
					helper: "Warehouses with stock",
					icon: Warehouse,
					label: "Warehouses",
					tone: "violet",
					value: new Set(records.map((record) => record.warehouseId)).size,
				},
			]}
			className="xl:grid-cols-4"
		/>
	);
}
