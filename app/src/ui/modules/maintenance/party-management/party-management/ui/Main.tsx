"use client";

import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/party-management/usePartyManagement";
import { PartyInformationHeader } from "./PartyInformationHeader";
import { PartyInformationTable } from "./PartyInformationTable";

export function PartyManagementPartyManagementMain() {
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
