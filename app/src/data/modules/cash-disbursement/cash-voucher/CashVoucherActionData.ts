import {
  CashVoucherHref,
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { readAccountingGridSession } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherAccountingGridSessionData";
import { createCashVoucherFormValues } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherTransactionRecord,
  CashVoucherActionMode,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export function getCashVoucherActionMode(pathname: string): CashVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

export function createInitialCashVoucherFormValues({
  mode,
  transaction,
  voucher,
}: {
  mode: CashVoucherActionMode;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  const defaultValues = createCashVoucherFormValues(transaction, voucher);

  if (mode === "add") {
    return defaultValues;
  }

  const session = readAccountingGridSession();

  if (session?.mode !== mode) {
    return defaultValues;
  }

  return {
    ...defaultValues,
    ...session.values,
    referenceModule: session.values.referenceModule.trim() || defaultValues.referenceModule,
    voucherReferenceNo: session.values.voucherReferenceNo.trim() || defaultValues.voucherReferenceNo,
  };
}

export function canUpdateCashVoucherStatus(currentStatus: CashVoucherStatus, nextStatus: CashVoucherStatus) {
  if (nextStatus === CashVoucherStatuses.posted) {
    return canApproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.disapproved) {
    return canDisapproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.cancelled) {
    return canCancelCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.forApproval) {
    return (
      currentStatus === CashVoucherStatuses.posted ||
      currentStatus === CashVoucherStatuses.disapproved ||
      currentStatus === CashVoucherStatuses.cancelled
    );
  }

  if (
    nextStatus === CashVoucherStatuses.draft &&
    (currentStatus === CashVoucherStatuses.posted || currentStatus === CashVoucherStatuses.disapproved)
  ) {
    return true;
  }

  if (nextStatus === CashVoucherStatuses.draft) {
    return currentStatus === CashVoucherStatuses.cancelled;
  }

  return false;
}

export function createVoucherActionReturnHref(from: string | null, transactionId?: string) {
  if (from === "view" && transactionId) {
    return `${CashVoucherHref}/view/${transactionId}`;
  }

  return CashVoucherHref;
}

export function createManualCashVoucherTransactionId() {
  return `cv-tx-manual-${Date.now()}`;
}


