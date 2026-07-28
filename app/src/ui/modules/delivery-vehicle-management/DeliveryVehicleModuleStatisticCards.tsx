"use client";

import { AlertTriangle, BarChart3, CheckCircle2, ListChecks } from "lucide-react";
import type { DeliveryVehicleModulePageState } from "@/app/src/types/modules/delivery-vehicle-management/DeliveryVehicleModuleTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

type DeliveryVehicleModuleStatisticCardsProps = {
	isLoading?: boolean;
	page: Pick<DeliveryVehicleModulePageState, "config" | "statistics">;
};

export function DeliveryVehicleModuleStatisticCards({
	isLoading = false,
	page,
}: DeliveryVehicleModuleStatisticCardsProps) {
	const items: ModuleStatisticCardItem[] = [
		{
			icon: ListChecks,
			label: "Total Records",
			summary: `Filtered ${page.config.noun} records`,
			value: page.statistics.total,
		},
		{
			icon: CheckCircle2,
			iconClassName: "bg-emerald-50 text-emerald-700",
			label: page.config.insightLabel,
			summary: page.config.insightStatuses.join(", "),
			value: page.statistics.insight,
		},
		{
			icon: AlertTriangle,
			iconClassName: "bg-amber-50 text-amber-700",
			label: "Needs Attention",
			summary: "Records with operational alerts",
			value: page.statistics.attention,
		},
		{
			icon: BarChart3,
			iconClassName: "bg-cyan-50 text-cyan-700",
			label: "Avg Progress",
			summary: "Based on visible records",
			value: `${page.statistics.averageProgress}%`,
		},
	];

	return (
		<ModuleStatisticCards
			className="2xl:grid-cols-4"
			isLoading={isLoading}
			items={items}
		/>
	);
}
