"use client";

import { useState } from "react";
import { usePartyManagementListPage } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagementListPage";
import { PartyInformationHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationHeader";
import { PartyManagementImportDialog } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementImportDialog";
import { PartyManagementStatisticCards } from "@/app/src/ui/modules/maintenance/party-management/PartyManagementStatisticCards";
import { PartyInformationTable } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTable";

export function PartyManagementListPage() {
	const [isImportOpen, setIsImportOpen] = useState(false);
	const page = usePartyManagementListPage();

	return (
		<section className="grid gap-5">
			<PartyInformationHeader onImport={() => setIsImportOpen(true)} />
			<PartyManagementStatisticCards analytics={page.analytics} />
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
