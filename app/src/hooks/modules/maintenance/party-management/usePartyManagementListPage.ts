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
    isRefreshing: partyManagement.isRefreshing,
    records: partyManagement.records,
    refreshRecords: partyManagement.refreshRecords,
  };
}

function getPartyManagementAnalytics(
  records: PartyInformationRecord[],
): PartyManagementAnalytics {
  return records.reduce<PartyManagementAnalytics>(
    (analytics, record) => {
      analytics.totalpartyName += 1;

      if (record.status === "Active") {
        analytics.activepartyName += 1;
      } else {
        analytics.inactivepartyName += 1;
      }

      if (record.classification === "Individual") {
        analytics.individualpartyName += 1;
      } else {
        analytics.organizationpartyName += 1;
      }

      return analytics;
    },
    {
      activepartyName: 0,
      inactivepartyName: 0,
      individualpartyName: 0,
      organizationpartyName: 0,
      totalpartyName: 0,
    },
  );
}
