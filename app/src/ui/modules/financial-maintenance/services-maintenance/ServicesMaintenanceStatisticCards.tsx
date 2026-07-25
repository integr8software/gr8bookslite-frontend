"use client";

import { useMemo } from "react";
import { CheckCircle2, CirclePause, ReceiptText, Tags } from "lucide-react";
import type { ServicesMaintenanceStatistics } from "@/app/src/types/modules/financial-maintenance/services-maintenance/ServicesMaintenanceTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function ServicesMaintenanceStatisticCards({
	isLoading,
	statistics,
}: {
	isLoading?: boolean;
	statistics: ServicesMaintenanceStatistics;
}) {
	const items = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: ReceiptText,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Services",
				summary: "All service records",
				value: statistics.totalServices,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active",
				summary: "Available for transactions",
				value: statistics.activeServices,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive",
				summary: "Hidden from new transactions",
				value: statistics.inactiveServices,
			},
			{
				icon: Tags,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Account Titles",
				summary: "Linked revenue accounts",
				value: statistics.accountTitles,
			},
		],
		[statistics],
	);

	return (
		<ModuleStatisticCards
			items={items}
			isLoading={isLoading}
			className="xl:grid-cols-4"
		/>
	);
}
