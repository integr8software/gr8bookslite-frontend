import {
  CashVoucherLink,
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
  getCashVoucherViewLink,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import { createCashVoucherFormValues } from "@/app/src/data/modules/cash-disbursement/cash-voucher/CashVoucherData";
import type {
  CashVoucherTransactionRecord,
  CashVoucherActionMode,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";

export function createInitialCashVoucherFormValues({
  transaction,
  voucher,
}: {
  mode: CashVoucherActionMode;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  return createCashVoucherFormValues(transaction, voucher);
}

export function canUpdateCashVoucherStatus(currentStatus: CashVoucherStatus, nextStatus: CashVoucherStatus) {
  if (nextStatus === CashVoucherStatuses.Posted) {
    return canApproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.Disapproved) {
    return canDisapproveCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.Cancelled) {
    return canCancelCashVoucherStatus(currentStatus);
  }

  if (nextStatus === CashVoucherStatuses.ForApproval) {
    return (
      currentStatus === CashVoucherStatuses.Posted ||
      currentStatus === CashVoucherStatuses.Disapproved ||
      currentStatus === CashVoucherStatuses.Cancelled
    );
  }

  if (
    nextStatus === CashVoucherStatuses.Draft &&
    (currentStatus === CashVoucherStatuses.Posted || currentStatus === CashVoucherStatuses.Disapproved)
  ) {
    return true;
  }

  if (nextStatus === CashVoucherStatuses.Draft) {
    return currentStatus === CashVoucherStatuses.Cancelled;
  }

  return false;
}

export function createVoucherActionReturnLink(from: string | null, transactionId?: string) {
  if (from === "view" && transactionId) {
    return getCashVoucherViewLink(transactionId);
  }

  return CashVoucherLink;
}
