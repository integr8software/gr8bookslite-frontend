import { CheckCircle2, CirclePause, MapPin, Ruler } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseStorageStatisticCardsProps = {
	isLoading: boolean;
	statistics: {
		activeRecords: number;
		blockedRecords: number;
		capacityTrackedRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseStorageStatisticCards({
	isLoading,
	statistics,
}: WarehouseStorageStatisticCardsProps) {
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
					helper: "Blocked or inactive",
					icon: CirclePause,
					label: "Unavailable",
					tone: "amber",
					value: statistics.blockedRecords,
				},
				{
					helper: "With capacity rules",
					icon: Ruler,
					label: "Capacity",
					tone: "violet",
					value: statistics.capacityTrackedRecords,
				},
			]}
			className="xl:grid-cols-4"
		/>
	);
}
