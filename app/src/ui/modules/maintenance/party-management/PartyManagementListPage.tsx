"use client";

import { useMemo } from "react";
import {
	Building2,
	CheckCircle2,
	CirclePause,
	UserRound,
	Users,
} from "lucide-react";
import { usePartyManagementListPage } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementListPage";
import {
	ModuleMetrics,
	type ModuleMetricItem,
} from "@/app/src/ui/shared/module/ModuleMetrics";
import { PartyInformationHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationHeader";
import { PartyInformationTable } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTable";

export function PartyManagementListPage() {
	const page = usePartyManagementListPage();
	const metrics = useMemo<ModuleMetricItem[]>(
		() => [
			{
				helper: "All party records",
				icon: Users,
				label: "Total Party Members",
				value: page.analytics.totalPartyMembers,
			},
			{
				helper: "Available for transactions",
				icon: CheckCircle2,
				label: "Active Members",
				tone: "emerald",
				value: page.analytics.activePartyMembers,
			},
			{
				helper: "Currently inactive",
				icon: CirclePause,
				label: "Inactive Members",
				tone: "amber",
				value: page.analytics.inactivePartyMembers,
			},
			{
				helper: "Individual profiles",
				icon: UserRound,
				label: "Individuals",
				tone: "cyan",
				value: page.analytics.individualPartyMembers,
			},
			{
				helper: "Company profiles",
				icon: Building2,
				label: "Organizations",
				tone: "violet",
				value: page.analytics.organizationPartyMembers,
			},
		],
		[page.analytics],
	);

	return (
		<section className="grid gap-5">
			<PartyInformationHeader />
			<ModuleMetrics metrics={metrics} />
			<PartyInformationTable
				isLoading={page.isLoading}
				records={page.records}
			/>
		</section>
	);
}
