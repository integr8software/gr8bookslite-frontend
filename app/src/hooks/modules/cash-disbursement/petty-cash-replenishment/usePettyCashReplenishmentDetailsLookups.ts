"use client";

import { useCashDisbursementDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/useCashDisbursementDetailsLookups";
import {
  fetchPettyCashReplenishmentAccountOptions,
  fetchPettyCashReplenishmentPartyOptions,
  fetchPettyCashReplenishmentResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentApi";
import type { PettyCashReplenishmentActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-replenishment/PettyCashReplenishmentTypes";

const PettyCashReplenishmentLookupModuleKey = "petty-cash-replenishment";

export function usePettyCashReplenishmentDetailsLookups(values: PettyCashReplenishmentActionPageState["values"]) {
  return useCashDisbursementDetailsLookups({
    fetchAccountOptions: fetchPettyCashReplenishmentAccountOptions,
    fetchPartyOptions: fetchPettyCashReplenishmentPartyOptions,
    fetchResponsibilityCenterOptions: fetchPettyCashReplenishmentResponsibilityCenters,
    moduleKey: PettyCashReplenishmentLookupModuleKey,
    values,
  });
}
