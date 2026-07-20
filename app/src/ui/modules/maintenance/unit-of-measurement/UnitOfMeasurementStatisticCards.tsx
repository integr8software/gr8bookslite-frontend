"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, Hash, Ruler } from "lucide-react";
import type { UnitOfMeasurementStatisticCardsProps } from "@/app/src/types/modules/maintenance/unit-of-measurement/UnitOfMeasurementTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function UnitOfMeasurementStatisticCards({
	isLoading,
	statistics,
}: UnitOfMeasurementStatisticCardsProps) {
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Ruler,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Units",
				summary: "Configured units",
				value: statistics.totalUnits,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active",
				summary: "Available for transactions",
				value: statistics.activeUnits,
			},
			{
				icon: Hash,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Decimal",
				summary: "Allows decimal quantities",
				value: statistics.decimalUnits,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive",
				summary: "Kept for history",
				value: statistics.inactiveUnits,
			},
		],
		[statistics],
	);

	return (
		<ModuleStatisticCards
			items={statisticCards}
			isLoading={isLoading}
			className="xl:grid-cols-4"
		/>
	);
}
