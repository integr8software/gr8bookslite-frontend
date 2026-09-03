import {
  DisbursementVoucherLink,
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
  getDisbursementVoucherViewLink,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { createDisbursementVoucherFormValues } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function createInitialDisbursementVoucherFormValues({
  transaction,
  voucher,
}: {
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  return createDisbursementVoucherFormValues(transaction, voucher);
}

export function canUpdateDisbursementVoucherStatus(currentStatus: DisbursementVoucherStatus, nextStatus: DisbursementVoucherStatus) {
  if (nextStatus === DisbursementVoucherStatuses.Posted) {
    return canApproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.Disapproved) {
    return canDisapproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.Cancelled) {
    return canCancelDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.ForApproval) {
    return (
      currentStatus === DisbursementVoucherStatuses.Posted ||
      currentStatus === DisbursementVoucherStatuses.Disapproved ||
      currentStatus === DisbursementVoucherStatuses.Cancelled
    );
  }

  if (
    nextStatus === DisbursementVoucherStatuses.Draft &&
    (currentStatus === DisbursementVoucherStatuses.Posted || currentStatus === DisbursementVoucherStatuses.Disapproved)
  ) {
    return true;
  }

  if (nextStatus === DisbursementVoucherStatuses.Draft) {
    return currentStatus === DisbursementVoucherStatuses.Cancelled;
  }

  return false;
}

export function createVoucherActionReturnLink(from: string | null, transactionId?: string) {
  if (from === "view" && transactionId) {
    return getDisbursementVoucherViewLink(transactionId);
  }

  return DisbursementVoucherLink;
}
