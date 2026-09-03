"use client";

import { useMaintenanceDetailsLookups } from "@/app/src/hooks/shared/maintenance/useMaintenanceDetailsLookups";
import {
  fetchPettyCashReplenishmentAccountOptions,
  fetchPettyCashReplenishmentPartyOptions,
  fetchPettyCashReplenishmentResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";
import type { PettyCashReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

const PettyCashReplenishmentLookupModuleKey = "petty-cash-replenishment";

export function usePettyCashReplenishmentDetailsLookups(values: PettyCashReplenishmentActionPageState["values"]) {
  return useMaintenanceDetailsLookups({
    fetchAccountOptions: fetchPettyCashReplenishmentAccountOptions,
    fetchPartyOptions: fetchPettyCashReplenishmentPartyOptions,
    fetchResponsibilityCenterOptions: fetchPettyCashReplenishmentResponsibilityCenters,
    moduleKey: PettyCashReplenishmentLookupModuleKey,
    querySegment: "cash-disbursement",
    values,
  });
}
