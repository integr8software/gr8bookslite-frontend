"use client";

import { useMemo } from "react";
import {
	Building2,
	CheckCircle2,
	CirclePause,
	FolderKanban,
	Layers3,
	Network,
} from "lucide-react";
import type { ResponsibilityCenterStatisticCardsProps } from "@/app/src/types/modules/maintenance/responsibility-center/ResponsibilityCenterTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function ResponsibilityCenterStatisticCards({
	isLoading,
	statistics,
}: ResponsibilityCenterStatisticCardsProps) {
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Network,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Centers",
				summary: "All responsibility centers",
				value: statistics.totalCenters,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Centers",
				summary: "Available for selection",
				value: statistics.activeCenters,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Centers",
				summary: "Currently inactive",
				value: statistics.inactiveCenters,
			},
			{
				icon: Layers3,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Departments",
				summary: "Department dimensions",
				value: statistics.departmentCenters,
			},
			{
				icon: Building2,
				iconClassName: "bg-violet-50 text-violet-700",
				label: "Branches",
				summary: "Branch dimensions",
				value: statistics.branchCenters,
			},
			{
				icon: FolderKanban,
				iconClassName: "bg-slate-100 text-slate-700",
				label: "Projects",
				summary: "Project dimensions",
				value: statistics.projectCenters,
			},
		],
		[statistics],
	);

	return (
		<ModuleStatisticCards
			items={statisticCards}
			isLoading={isLoading}
			className="xl:grid-cols-6"
		/>
	);
}
