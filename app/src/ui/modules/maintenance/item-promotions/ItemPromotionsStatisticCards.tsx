import { BadgePercent, CheckCircle2, CirclePause, Tag } from "lucide-react";
import { ModuleStatisticCards } from "@/app/src/ui/shared/module/ModuleStatisticCards";
import type { ItemPromotionListRecord } from "@/app/src/types/modules/maintenance/item-promotions/ItemPromotionsTypes";

export function ItemPromotionsStatisticCards({
	activeCount,
	records,
}: {
	activeCount: number;
	records: ItemPromotionListRecord[];
}) {
	return (
		<ModuleStatisticCards
			items={[
				{
					helper: "Promotion records",
					icon: BadgePercent,
					label: "Total Promotions",
					value: records.length,
				},
				{
					helper: "Available for transactions",
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
					helper: "Promotion methods",
					icon: Tag,
					label: "Types",
					tone: "violet",
					value: new Set(records.map((record) => record.type)).size,
				},
			]}
		/>
	);
}
