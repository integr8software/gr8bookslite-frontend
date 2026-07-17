"use client";

import { useMemo } from "react";
import {
	Building2,
	CheckCircle2,
	CirclePause,
	Tags,
	UserRound,
	Users,
} from "lucide-react";
import type { PartyManagementStatisticCardsProps } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";

export function PartyManagementStatisticCards({
	analytics,
}: PartyManagementStatisticCardsProps) {
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Users,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Party Members",
				summary: "All party records",
				value: analytics.totalpartyName,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Members",
				summary: "Available for transactions",
				value: analytics.activepartyName,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Members",
				summary: "Currently inactive",
				value: analytics.inactivepartyName,
			},
			{
				icon: UserRound,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Individuals",
				summary: "Individual profiles",
				value: analytics.individualpartyName,
			},
			{
				icon: Building2,
				iconClassName: "bg-violet-50 text-violet-700",
				label: "Non-Individual",
				summary: "Non-individual profiles",
				value: analytics.organizationpartyName,
			},
			{
				icon: Tags,
				iconClassName: "bg-slate-100 text-slate-700",
				label: "Multi-Type Parties",
				summary: "Assigned multiple types",
				value: analytics.multiTypepartyName,
			},
		],
		[analytics],
	);

	return (
		<ModuleStatisticCards
			items={statisticCards}
			className="2xl:grid-cols-6"
		/>
	);
}
