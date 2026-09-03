"use client";

import { useMaintenanceDetailsLookups } from "@/app/src/hooks/shared/maintenance/useMaintenanceDetailsLookups";
import {
  fetchRevolvingFundReplenishmentAccountOptions,
  fetchRevolvingFundReplenishmentPartyOptions,
  fetchRevolvingFundReplenishmentResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";
import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";

const RevolvingFundReplenishmentLookupModuleKey = "revolving-fund-replenishment";

export function useRevolvingFundReplenishmentDetailsLookups(values: RevolvingFundReplenishmentActionPageState["values"]) {
  return useMaintenanceDetailsLookups({
    fetchAccountOptions: fetchRevolvingFundReplenishmentAccountOptions,
    fetchPartyOptions: fetchRevolvingFundReplenishmentPartyOptions,
    fetchResponsibilityCenterOptions: fetchRevolvingFundReplenishmentResponsibilityCenters,
    moduleKey: RevolvingFundReplenishmentLookupModuleKey,
    querySegment: "cash-disbursement",
    values,
  });
}
