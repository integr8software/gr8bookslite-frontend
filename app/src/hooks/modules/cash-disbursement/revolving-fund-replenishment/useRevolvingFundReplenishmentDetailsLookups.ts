"use client";

import { useCashDisbursementDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/useCashDisbursementDetailsLookups";
import {
  fetchRevolvingFundReplenishmentAccountOptions,
  fetchRevolvingFundReplenishmentPartyOptions,
  fetchRevolvingFundReplenishmentResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentApi";
import type { RevolvingFundReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/revolving-fund-replenishment/RevolvingFundReplenishmentTypes";

const RevolvingFundReplenishmentLookupModuleKey = "revolving-fund-replenishment";

export function useRevolvingFundReplenishmentDetailsLookups(values: RevolvingFundReplenishmentActionPageState["values"]) {
  return useCashDisbursementDetailsLookups({
    fetchAccountOptions: fetchRevolvingFundReplenishmentAccountOptions,
    fetchPartyOptions: fetchRevolvingFundReplenishmentPartyOptions,
    fetchResponsibilityCenterOptions: fetchRevolvingFundReplenishmentResponsibilityCenters,
    moduleKey: RevolvingFundReplenishmentLookupModuleKey,
    values,
  });
}
