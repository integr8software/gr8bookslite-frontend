"use client";

import { useCashDisbursementDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/useCashDisbursementDetailsLookups";
import {
  fetchPettyCashFundAccountOptions,
  fetchPettyCashFundPartyOptions,
  fetchPettyCashFundResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-fund/PettyCashFundApi";
import type { PettyCashFundActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-fund/PettyCashFundTypes";

const PettyCashFundLookupModuleKey = "petty-cash-fund";

export function usePettyCashFundDetailsLookups(values: PettyCashFundActionPageState["values"]) {
  return useCashDisbursementDetailsLookups({
    fetchAccountOptions: fetchPettyCashFundAccountOptions,
    fetchPartyOptions: fetchPettyCashFundPartyOptions,
    fetchResponsibilityCenterOptions: fetchPettyCashFundResponsibilityCenters,
    moduleKey: PettyCashFundLookupModuleKey,
    values,
  });
}
