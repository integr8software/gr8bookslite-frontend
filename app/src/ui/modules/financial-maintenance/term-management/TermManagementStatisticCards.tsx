"use client";

import { useMemo } from "react";
import { CalendarDays, CheckCircle2, CirclePause, Hash } from "lucide-react";
import type { TermManagementStatisticCardsProps } from "@/app/src/types/modules/financial-maintenance/term-management/TermManagementTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function TermManagementStatisticCards({
	isLoading,
	statistics,
}: TermManagementStatisticCardsProps) {
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: CalendarDays,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Terms",
				summary: "All term definitions",
				value: statistics.totalTerms,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Terms",
				summary: "Available for selection",
				value: statistics.activeTerms,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Terms",
				summary: "Currently inactive",
				value: statistics.inactiveTerms,
			},
			{
				icon: Hash,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Day Mode",
				summary: "Uses day-based periods",
				value: statistics.dayTerms,
			},
			{
				icon: CalendarDays,
				iconClassName: "bg-violet-50 text-violet-700",
				label: "Month Mode",
				summary: "Uses month-based periods",
				value: statistics.monthTerms,
			},
			{
				icon: CalendarDays,
				iconClassName: "bg-slate-100 text-slate-700",
				label: "Year Mode",
				summary: "Uses year-based periods",
				value: statistics.yearTerms,
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
