import type { PartyManagementListQuery } from "@/app/src/types/modules/maintenance/party-management/PartyManagementTypes";

export const PartyManagementQueryKeys = {
	all: () => ["party-management", "party-information"] as const,
	list: (query: PartyManagementListQuery, recordsVersion: string) =>
		[...PartyManagementQueryKeys.all(), "list", query, recordsVersion] as const,
	records: () => [...PartyManagementQueryKeys.all(), "records"] as const,
};
