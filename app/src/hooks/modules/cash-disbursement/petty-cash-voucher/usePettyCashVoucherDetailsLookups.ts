"use client";

import { useCashDisbursementDetailsLookups } from "@/app/src/hooks/modules/cash-disbursement/useCashDisbursementDetailsLookups";
import {
  fetchPettyCashVoucherAccountOptions,
  fetchPettyCashVoucherPartyOptions,
  fetchPettyCashVoucherResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";
import type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

const PettyCashVoucherLookupModuleKey = "petty-cash-voucher";

export function usePettyCashVoucherDetailsLookups(values: PettyCashVoucherActionPageState["values"]) {
  return useCashDisbursementDetailsLookups({
    fetchAccountOptions: fetchPettyCashVoucherAccountOptions,
    fetchPartyOptions: fetchPettyCashVoucherPartyOptions,
    fetchResponsibilityCenterOptions: fetchPettyCashVoucherResponsibilityCenters,
    moduleKey: PettyCashVoucherLookupModuleKey,
    values,
  });
}
