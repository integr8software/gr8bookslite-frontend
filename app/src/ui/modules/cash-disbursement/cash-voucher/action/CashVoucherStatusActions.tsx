import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  CashVoucherStatuses,
  canApproveCashVoucherStatus,
  canCancelCashVoucherStatus,
  canDisapproveCashVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/cash-voucher/CashVoucherConstants";
import type {
  CashVoucherTransactionRecord,
  CashVoucherRecord,
  CashVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/cash-voucher/CashVoucherTypes";
import type { VoucherReportPreviewFormat } from "@/app/src/types/shared/reports/ReportTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames, moduleStatusActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { VoucherReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { CashVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/cash-voucher/action/CashVoucherActionHistory";

export function CashVoucherStatusActions({
  onRequestStatusConfirmation,
  onUpdateStatus,
  onPreview,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: CashVoucherStatus) => void;
  onUpdateStatus?: (status: CashVoucherStatus) => void;
  onPreview?: (format: VoucherReportPreviewFormat) => void;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  const actions = createCashVoucherStatusActionItems({
    onRequestStatusConfirmation,
    onUpdateStatus,
    transaction,
    voucher,
  });
  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
        <CashVoucherActionHistory transaction={transaction} voucher={voucher} />
        <ModuleActionMenu items={actions} label="Cash Voucher Actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
        <CashVoucherActionHistory transaction={transaction} voucher={voucher} />
        {actions.map((action) => {
          if (action.type === "button") {
            return <HeaderActionButton key={action.label} action={action} />;
          }

          return null;
        })}
      </div>
    </>
  );
}

function createCashVoucherStatusActionItems({
  onRequestStatusConfirmation,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: CashVoucherStatus) => void;
  onUpdateStatus?: (status: CashVoucherStatus) => void;
  transaction?: CashVoucherTransactionRecord;
  voucher?: CashVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? CashVoucherStatuses.Open;
  const isPosted = status === CashVoucherStatuses.Posted;
  const isDisapproved = status === CashVoucherStatuses.Disapproved;
  const isCancelled = status === CashVoucherStatuses.Cancelled;
  const approvalUndoStatus: CashVoucherStatus = CashVoucherStatuses.ForApproval;
  const cancelStatus: CashVoucherStatus = isCancelled
    ? voucher
      ? CashVoucherStatuses.Draft
      : CashVoucherStatuses.ForApproval
    : CashVoucherStatuses.Cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !onUpdateStatus || !canApproveCashVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => onRequestStatusConfirmation(isPosted ? approvalUndoStatus : CashVoucherStatuses.Posted),
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveCashVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onRequestStatusConfirmation(isDisapproved ? approvalUndoStatus : CashVoucherStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelCashVoucherStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => onRequestStatusConfirmation(cancelStatus),
      tone: isCancelled ? "default" : "warning",
      type: "button",
    },
  ];

  return actions;
}

function HeaderActionButton({ action }: { action: Extract<ModuleActionMenuItem, { type: "button" }> }) {
  const Icon = action.icon;
  const className = getStatusActionButtonClassName(action);

  return (
    <button type="button" disabled={action.disabled} onClick={action.onSelect} className={className}>
      <Icon className="h-4 w-4" aria-hidden="true" />
      {action.label}
    </button>
  );
}

function getStatusActionButtonClassName(action: Extract<ModuleActionMenuItem, { type: "button" }>) {
  if (action.label === "Approve") {
    return moduleStatusActionClassNames.approve;
  }

  if (action.label === "Disapprove") {
    return moduleStatusActionClassNames.disapprove;
  }

  if (action.label === "Cancel") {
    return moduleStatusActionClassNames.cancel;
  }

  if (action.label === "Undo Approved" || action.label === "Undo Disapproved" || action.label === "Undo Cancelled") {
    return moduleStatusActionClassNames.undo;
  }

  if (action.tone === "danger") {
    return moduleStatusActionClassNames.danger;
  }

  return moduleHeaderActionClassNames.secondary;
}
