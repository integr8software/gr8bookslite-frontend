import { CheckCircle2, CirclePause, MapPin, Warehouse } from "lucide-react";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type StorageLocationStatisticCardsProps = {
	isLoading: boolean;
	records: WarehouseModuleRecord[];
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function StorageLocationStatisticCards({
	isLoading,
	records,
	statistics,
}: StorageLocationStatisticCardsProps) {
	return (
		<ModuleStatisticCards
			isLoading={isLoading}
			items={[
				{
					helper: "Physical bins",
					icon: MapPin,
					label: "Total Locations",
					value: statistics.totalRecords,
				},
				{
					helper: "Available for use",
					icon: CheckCircle2,
					label: "Active",
					tone: "emerald",
					value: statistics.activeRecords,
				},
				{
					helper: "Inactive locations",
					icon: CirclePause,
					label: "Inactive",
					tone: "amber",
					value: statistics.otherRecords,
				},
				{
					helper: "Warehouses with locations",
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
