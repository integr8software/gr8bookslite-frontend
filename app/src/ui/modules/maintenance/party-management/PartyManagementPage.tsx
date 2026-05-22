"use client";

import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import { PartyInformationHeader } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationHeader";
import { PartyInformationTable } from "@/app/src/ui/modules/maintenance/party-management/PartyInformationTable";

export function PartyManagementMain() {
	const partyManagement = usePartyManagementStore((state) => ({
		isLoading: state.isLoading,
		records: state.records,
	}));

	return (
		<section className="grid gap-5">
			<PartyInformationHeader />
			<PartyInformationTable
				isLoading={partyManagement.isLoading}
				records={partyManagement.records}
			/>
		</section>
	);
}
