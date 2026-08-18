import { CashVoucherAccountingGridSessionStorageKey } from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type { CashVoucherAccountingGridSession } from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export function readAccountingGridSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(CashVoucherAccountingGridSessionStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as CashVoucherAccountingGridSession | null;
  } catch {
    return null;
  }
}

export function writeAccountingGridSession(value: CashVoucherAccountingGridSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(CashVoucherAccountingGridSessionStorageKey, JSON.stringify(value));
}

export function clearAccountingGridSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(CashVoucherAccountingGridSessionStorageKey);
}


