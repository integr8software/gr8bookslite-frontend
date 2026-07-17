import { CheckCircle2, CirclePause, ShieldCheck, Users } from "lucide-react";
import type { WarehouseModuleRecord } from "@/app/src/types/modules/maintenance/warehouses/WarehouseModuleTypes";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";

type WarehouseAccessStatisticCardsProps = {
	isLoading: boolean;
	records: WarehouseModuleRecord[];
	statistics: {
		activeRecords: number;
		otherRecords: number;
		totalRecords: number;
	};
};

export function WarehouseAccessStatisticCards({
	isLoading,
	records,
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
				{
					helper: "Users with access",
					icon: Users,
					label: "Users",
					tone: "violet",
					value: new Set(records.map((record) => record.values[1])).size,
				},
			]}
			className="xl:grid-cols-4"
		/>
	);
}
