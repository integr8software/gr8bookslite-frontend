"use client";

import { useMemo } from "react";
import { usePartyManagementStore } from "@/app/src/hooks/modules/maintenance/party-management/usePartyManagement";
import type {
	PartyInformationRecord,
	PartyManagementAnalytics,
} from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export function usePartyManagementListPage() {
	const partyManagement = usePartyManagementStore();
	const analytics = useMemo(
		() => getPartyManagementAnalytics(partyManagement.records),
		[partyManagement.records],
	);

	return {
		analytics,
		isLoading: partyManagement.isLoading,
		records: partyManagement.records,
	};
}

function getPartyManagementAnalytics(
	records: PartyInformationRecord[],
): PartyManagementAnalytics {
	return records.reduce<PartyManagementAnalytics>(
		(analytics, record) => {
			analytics.totalPartyMembers += 1;

			if (record.status === "Active") {
				analytics.activePartyMembers += 1;
			} else {
				analytics.inactivePartyMembers += 1;
			}

			if (record.classification === "Individual") {
				analytics.individualPartyMembers += 1;
			} else {
				analytics.organizationPartyMembers += 1;
			}

			return analytics;
		},
		{
			activePartyMembers: 0,
			inactivePartyMembers: 0,
			individualPartyMembers: 0,
			organizationPartyMembers: 0,
			totalPartyMembers: 0,
		},
	);
}
