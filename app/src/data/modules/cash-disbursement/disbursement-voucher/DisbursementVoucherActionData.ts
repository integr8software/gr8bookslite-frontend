import {
  DisbursementVoucherHref,
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import { readAccountingGridSession } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherAccountingGridSessionData";
import { createDisbursementVoucherFormValues } from "@/app/src/data/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherData";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherActionMode,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";

export function getDisbursementVoucherActionMode(pathname: string): DisbursementVoucherActionMode {
  if (pathname.includes("/view/")) {
    return "view";
  }

  if (pathname.includes("/edit/")) {
    return "edit";
  }

  return "add";
}

export function createInitialDisbursementVoucherFormValues({
  mode,
  transaction,
  voucher,
}: {
  mode: DisbursementVoucherActionMode;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const defaultValues = createDisbursementVoucherFormValues(transaction, voucher);

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

export function canUpdateDisbursementVoucherStatus(currentStatus: DisbursementVoucherStatus, nextStatus: DisbursementVoucherStatus) {
  if (nextStatus === DisbursementVoucherStatuses.posted) {
    return canApproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.disapproved) {
    return canDisapproveDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.cancelled) {
    return canCancelDisbursementVoucherStatus(currentStatus);
  }

  if (nextStatus === DisbursementVoucherStatuses.forApproval) {
    return (
      currentStatus === DisbursementVoucherStatuses.posted ||
      currentStatus === DisbursementVoucherStatuses.disapproved ||
      currentStatus === DisbursementVoucherStatuses.cancelled
    );
  }

  if (
    nextStatus === DisbursementVoucherStatuses.draft &&
    (currentStatus === DisbursementVoucherStatuses.posted || currentStatus === DisbursementVoucherStatuses.disapproved)
  ) {
    return true;
  }

  if (nextStatus === DisbursementVoucherStatuses.draft) {
    return currentStatus === DisbursementVoucherStatuses.cancelled;
  }

  return false;
}

export function createVoucherActionReturnHref(from: string | null, transactionId?: string) {
  if (from === "view" && transactionId) {
    return `${DisbursementVoucherHref}/view/${transactionId}`;
  }

  return DisbursementVoucherHref;
}

export function createManualDisbursementTransactionId() {
  return `dv-tx-manual-${Date.now()}`;
}
