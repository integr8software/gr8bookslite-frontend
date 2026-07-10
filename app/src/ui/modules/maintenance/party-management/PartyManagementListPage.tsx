"use client";

import { useMemo, useState } from "react";
import {
	Building2,
	CheckCircle2,
	CirclePause,
	Tags,
	UserRound,
	Users,
} from "lucide-react";
import { usePartyManagementListPage } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementListPage";
import {
	ModuleStatisticCards,
	type ModuleStatisticCardItem,
} from "@/app/src/ui/shared/module/ModuleStatisticCards";
import { PartyInformationHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationHeader";
import { PartyManagementImportDialog } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementImportDialog";
import { PartyInformationTable } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTable";

export function PartyManagementListPage() {
	const [isImportOpen, setIsImportOpen] = useState(false);
	const page = usePartyManagementListPage();
	const statisticCards = useMemo<ModuleStatisticCardItem[]>(
		() => [
			{
				icon: Users,
				iconClassName: "bg-skyblue/20 text-skyblue",
				label: "Total Party Members",
				summary: "All party records",
				value: page.analytics.totalpartyName,
			},
			{
				icon: CheckCircle2,
				iconClassName: "bg-emerald-50 text-emerald-700",
				label: "Active Members",
				summary: "Available for transactions",
				value: page.analytics.activepartyName,
			},
			{
				icon: CirclePause,
				iconClassName: "bg-amber-50 text-amber-700",
				label: "Inactive Members",
				summary: "Currently inactive",
				value: page.analytics.inactivepartyName,
			},
			{
				icon: UserRound,
				iconClassName: "bg-cyan-50 text-cyan-700",
				label: "Individuals",
				summary: "Individual profiles",
				value: page.analytics.individualpartyName,
			},
			{
				icon: Building2,
				iconClassName: "bg-violet-50 text-violet-700",
				label: "Non-Individual",
				summary: "Non-individual profiles",
				value: page.analytics.organizationpartyName,
			},
			{
				icon: Tags,
				iconClassName: "bg-slate-100 text-slate-700",
				label: "Multi-Type Parties",
				summary: "Assigned multiple types",
				value: page.analytics.multiTypepartyName,
			},
		],
		[page.analytics],
	);

	return (
		<section className="grid gap-5">
			<PartyInformationHeader onImport={() => setIsImportOpen(true)} />
			<ModuleStatisticCards
				items={statisticCards}
				className="2xl:grid-cols-6"
			/>
			<PartyInformationTable
				isLoading={page.isLoading}
				isRefreshing={page.isRefreshing}
				lastSyncedAt={page.lastSyncedAt}
				records={page.records}
				onRefresh={page.refreshRecords}
			/>
			<PartyManagementImportDialog
				existingParties={page.records}
				isOpen={isImportOpen}
				onClose={() => setIsImportOpen(false)}
				onImportParties={page.addRecords}
			/>
		</section>
	);
}
