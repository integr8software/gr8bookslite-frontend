"use client";

import { useMaintenanceDetailsLookups } from "@/app/src/hooks/shared/maintenance/useMaintenanceDetailsLookups";
import {
  fetchRevolvingFundAccountOptions,
  fetchRevolvingFundPartyOptions,
  fetchRevolvingFundResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";
import type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";

const RevolvingFundLookupModuleKey = "revolving-fund";

export function useRevolvingFundDetailsLookups(values: RevolvingFundActionPageState["values"]) {
  return useMaintenanceDetailsLookups({
    fetchAccountOptions: fetchRevolvingFundAccountOptions,
    fetchPartyOptions: fetchRevolvingFundPartyOptions,
    fetchResponsibilityCenterOptions: fetchRevolvingFundResponsibilityCenters,
    moduleKey: RevolvingFundLookupModuleKey,
    querySegment: "cash-disbursement",
    values,
  });
}
