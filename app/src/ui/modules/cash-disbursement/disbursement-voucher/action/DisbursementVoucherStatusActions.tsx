import { Ban, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import {
  DisbursementVoucherStatuses,
  canApproveDisbursementVoucherStatus,
  canCancelDisbursementVoucherStatus,
  canDisapproveDisbursementVoucherStatus,
} from "@/app/src/constants/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherConstants";
import type {
  DisbursementTransactionRecord,
  DisbursementVoucherRecord,
  DisbursementVoucherStatus,
} from "@/app/src/types/modules/cash-disbursement/disbursement-voucher/DisbursementVoucherTypes";
import type { VoucherReportPreviewFormat } from "@/app/src/types/shared/reports/ReportTypes";
import { ModuleActionMenu, type ModuleActionMenuItem } from "@/app/src/ui/shared/module/ModuleActionMenu";
import { moduleHeaderActionClassNames, moduleStatusActionClassNames } from "@/app/src/ui/shared/module/ModuleHeader";
import { VoucherReportPreviewAction } from "@/app/src/ui/shared/reports/Reports";
import { DisbursementVoucherActionHistory } from "@/app/src/ui/modules/cash-disbursement/disbursement-voucher/action/DisbursementVoucherActionHistory";

export function DisbursementVoucherStatusActions({
  onRequestStatusConfirmation,
  onUpdateStatus,
  onPreview,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: DisbursementVoucherStatus) => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  onPreview?: (format: VoucherReportPreviewFormat) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const actions = createDisbursementVoucherStatusActionItems({
    onRequestStatusConfirmation,
    onUpdateStatus,
    transaction,
    voucher,
  });
  return (
    <>
      <div className="flex items-center gap-2 lg:hidden">
        {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
        <DisbursementVoucherActionHistory transaction={transaction} voucher={voucher} />
        <ModuleActionMenu items={actions} label="Disbursement voucher actions" />
      </div>
      <div className="hidden flex-wrap gap-2 lg:flex">
        {onPreview ? <VoucherReportPreviewAction onPreview={onPreview} /> : null}
        <DisbursementVoucherActionHistory transaction={transaction} voucher={voucher} />
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

function createDisbursementVoucherStatusActionItems({
  onRequestStatusConfirmation,
  onUpdateStatus,
  transaction,
  voucher,
}: {
  onRequestStatusConfirmation: (status: DisbursementVoucherStatus) => void;
  onUpdateStatus?: (status: DisbursementVoucherStatus) => void;
  transaction?: DisbursementTransactionRecord;
  voucher?: DisbursementVoucherRecord;
}) {
  const status = voucher?.status ?? transaction?.status ?? DisbursementVoucherStatuses.Draft;
  const isPosted = status === DisbursementVoucherStatuses.Posted;
  const isDisapproved = status === DisbursementVoucherStatuses.Disapproved;
  const isCancelled = status === DisbursementVoucherStatuses.Cancelled;
  const approvalUndoStatus: DisbursementVoucherStatus = DisbursementVoucherStatuses.ForApproval;
  const cancelStatus: DisbursementVoucherStatus = isCancelled
    ? voucher
      ? DisbursementVoucherStatuses.Draft
      : DisbursementVoucherStatuses.ForApproval
    : DisbursementVoucherStatuses.Cancelled;
  const actions: ModuleActionMenuItem[] = [
    {
      disabled: !onUpdateStatus || !canApproveDisbursementVoucherStatus(status),
      icon: isPosted ? Undo2 : ThumbsUp,
      label: isPosted ? "Undo Approved" : "Approve",
      onSelect: () => onRequestStatusConfirmation(isPosted ? approvalUndoStatus : DisbursementVoucherStatuses.Posted),
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canDisapproveDisbursementVoucherStatus(status),
      icon: isDisapproved ? Undo2 : ThumbsDown,
      label: isDisapproved ? "Undo Disapproved" : "Disapprove",
      onSelect: () => onRequestStatusConfirmation(isDisapproved ? approvalUndoStatus : DisbursementVoucherStatuses.Disapproved),
      tone: isDisapproved ? "default" : "danger",
      type: "button",
    },
    {
      disabled: !onUpdateStatus || !canCancelDisbursementVoucherStatus(status),
      icon: isCancelled ? Undo2 : Ban,
      label: isCancelled ? "Undo Cancelled" : "Cancel",
      onSelect: () => onRequestStatusConfirmation(cancelStatus),
      tone: isCancelled ? "default" : "danger",
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
