"use client";

import { useCashDisbursementDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/useCashDisbursementDetailsLookups";
import {
  fetchRevolvingFundAccountOptions,
  fetchRevolvingFundPartyOptions,
  fetchRevolvingFundResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund/RevolvingFundApi";
import type { RevolvingFundActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund/RevolvingFundTypes";

const RevolvingFundLookupModuleKey = "revolving-fund";

export function useRevolvingFundDetailsLookups(values: RevolvingFundActionPageState["values"]) {
  return useCashDisbursementDetailsLookups({
    fetchAccountOptions: fetchRevolvingFundAccountOptions,
    fetchPartyOptions: fetchRevolvingFundPartyOptions,
    fetchResponsibilityCenterOptions: fetchRevolvingFundResponsibilityCenters,
    moduleKey: RevolvingFundLookupModuleKey,
    values,
  });
}
