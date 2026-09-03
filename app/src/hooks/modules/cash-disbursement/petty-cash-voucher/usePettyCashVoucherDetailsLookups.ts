"use client";

import { useMaintenanceDetailsLookups } from "@/app/src/hooks/shared/maintenance/useMaintenanceDetailsLookups";
import {
  fetchPettyCashVoucherAccountOptions,
  fetchPettyCashVoucherPartyOptions,
  fetchPettyCashVoucherResponsibilityCenters,
} from "@/app/src/services/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherApi";
import type { PettyCashVoucherActionPageState } from "@/app/src/types/modules/cash-disbursement/petty-cash-voucher/PettyCashVoucherTypes";

const PettyCashVoucherLookupModuleKey = "petty-cash-voucher";

export function usePettyCashVoucherDetailsLookups(values: PettyCashVoucherActionPageState["values"]) {
  return useMaintenanceDetailsLookups({
    fetchAccountOptions: fetchPettyCashVoucherAccountOptions,
    fetchPartyOptions: fetchPettyCashVoucherPartyOptions,
    fetchResponsibilityCenterOptions: fetchPettyCashVoucherResponsibilityCenters,
    moduleKey: PettyCashVoucherLookupModuleKey,
    querySegment: "cash-disbursement",
    values,
  });
}
