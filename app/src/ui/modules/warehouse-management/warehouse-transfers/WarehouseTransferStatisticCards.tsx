import { CheckCircle2, CirclePause, MoveRight, Truck } from "lucide-react";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/warehouse-management/warehouses/WarehouseModuleTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseTransferStatisticCardsProps = {
	isLoading: boolean;
	records: WarehouseModuleRecord[];
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseTransferStatisticCards({
	isLoading,
	records,
	statistics,
}: WarehouseTransferStatisticCardsProps) {
	return (
		<ModuleStatisticCards
			isLoading={isLoading}
			items={[
				{
					helper: "Transfer records",
					icon: MoveRight,
					label: "Total Transfers",
					value: statistics.totalRecords,
				},
				{
					helper: "Completed transfers",
					icon: CheckCircle2,
					label: "Completed",
					tone: "emerald",
					value: statistics.activeRecords,
				},
				{
					helper: "Open or pending",
					icon: CirclePause,
					label: "Other",
					tone: "amber",
					value: statistics.otherRecords,
				},
				{
					helper: "Currently moving",
					icon: Truck,
					label: "In Transit",
					tone: "violet",
					value: records.filter((record) => record.status === "In Transit")
						.length,
				},
			]}
			className="xl:grid-cols-4"
		/>
	);
}
