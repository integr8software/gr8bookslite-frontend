import { CheckCircle2, CirclePause, MapPin } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type StorageLocationStatisticCardsProps = {
	isLoading: boolean;
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function StorageLocationStatisticCards({
	isLoading,
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
			]}
		/>
	);
}
