import { CheckCircle2, CirclePause, Layers, Package } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import type { ItemBundleListRecord } from "@/app/src/types/modules/item-management/item-bundles/ItemBundlesTypes";

export function ItemBundlesStatisticCards({
	activeCount,
	records,
}: {
	activeCount: number;
	records: ItemBundleListRecord[];
}) {
	return (
		<ModuleStatisticCards
			className="xl:grid-cols-4"
			items={[
				{
					helper: "Bundle records",
					icon: Layers,
					label: "Total Bundles",
					value: records.length,
				},
				{
					helper: "Available for selling",
					icon: CheckCircle2,
					label: "Active",
					tone: "emerald",
					value: activeCount,
				},
				{
					helper: "Kept for history",
					icon: CirclePause,
					label: "Inactive",
					tone: "amber",
					value: records.length - activeCount,
				},
				{
					helper: "Component lines",
					icon: Package,
					label: "Components",
					tone: "violet",
					value: records.reduce(
						(total, row) => total + row.components.length,
						0,
					),
				},
			]}
		/>
	);
}
