import { CheckCircle2, CirclePause, MoveRight } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseTransferStatisticCardsProps = {
	isLoading: boolean;
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseTransferStatisticCards({
	isLoading,
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
			]}
		/>
	);
}
