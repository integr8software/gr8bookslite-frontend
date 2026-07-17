import { CheckCircle2, CirclePause, ShieldCheck } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseAccessStatisticCardsProps = {
	isLoading: boolean;
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseAccessStatisticCards({
	isLoading,
	statistics,
}: WarehouseAccessStatisticCardsProps) {
	return (
		<ModuleStatisticCards
			isLoading={isLoading}
			items={[
				{
					helper: "Access assignments",
					icon: ShieldCheck,
					label: "Total Records",
					value: statistics.totalRecords,
				},
				{
					helper: "Currently active",
					icon: CheckCircle2,
					label: "Active",
					tone: "emerald",
					value: statistics.activeRecords,
				},
				{
					helper: "Inactive assignments",
					icon: CirclePause,
					label: "Inactive",
					tone: "amber",
					value: statistics.otherRecords,
				},
			]}
		/>
	);
}
