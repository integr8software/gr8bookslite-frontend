import { DisbursementVoucherAccountingGridSessionStorageKey } from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type { DisbursementVoucherAccountingGridSession } from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function readAccountingGridSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(DisbursementVoucherAccountingGridSessionStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as DisbursementVoucherAccountingGridSession | null;
  } catch {
    return null;
  }
}

export function writeAccountingGridSession(value: DisbursementVoucherAccountingGridSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(DisbursementVoucherAccountingGridSessionStorageKey, JSON.stringify(value));
}

export function clearAccountingGridSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(DisbursementVoucherAccountingGridSessionStorageKey);
}
